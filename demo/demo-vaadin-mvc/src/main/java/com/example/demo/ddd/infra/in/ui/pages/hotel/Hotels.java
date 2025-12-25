package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.hotel.HotelRepository;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

record HotelRow(String id, String name) {

}

@Service
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class Hotels implements ListingBackend<NoFilters, HotelRow> {

    final HotelRepository hotelRepository;

    @Override
    public ListingData<HotelRow> search(String searchText, NoFilters noFilters, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(hotelRepository.findAll().stream()
                .map(hotel -> new HotelRow(hotel.id(), hotel.name()))
                .toList());
    }
}
