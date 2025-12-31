package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Destination;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Destinations extends GenericCrud<Destination> {

    final DestinationRepository destinationRepository;


    @Override
    public Repository<Destination, String> repository() {
        return destinationRepository;
    }
}
