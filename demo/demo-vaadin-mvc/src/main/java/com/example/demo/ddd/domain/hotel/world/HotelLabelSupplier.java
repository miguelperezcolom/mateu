package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.domain.hotel.hotel.Hotel;
import com.example.demo.ddd.domain.hotel.hotel.HotelRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HotelLabelSupplier implements LabelSupplier {

    final HotelRepository hotelRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return hotelRepository.findById((String) id)
                .map(Hotel::name)
                .orElse("No hotel with id " + id);
    }
}
