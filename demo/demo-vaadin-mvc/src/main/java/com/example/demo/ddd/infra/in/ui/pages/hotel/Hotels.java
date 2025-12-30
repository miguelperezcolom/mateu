package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.hotel.Hotel;
import com.example.demo.ddd.domain.hotel.hotel.HotelRepository;
import com.example.demo.ddd.domain.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class Hotels extends GenericCrud<Hotel> {

    final HotelRepository hotelRepository;

    @Override
    public Repository<Hotel, String> repository() {
        return hotelRepository;
    }


    @ListToolbarButton
    void resetImage(HttpRequest httpRequest) {
        log.info("reset image {}", httpRequest.getSelectedRows(Map.class));
    }

    @ViewToolbarButton
    Object test(Hotel hotel, HttpRequest httpRequest) {
        log.info("test {}", hotel);
        return Message.builder()
                .text("Hola " + hotel.name())
                .build();
    }
}
