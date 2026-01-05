package com.example.demo.ddd.infra.in.ui.pages.hotel;

import io.mateu.uidl.interfaces.Repository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Destination;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
import io.mateu.core.infra.declarative.GenericCrud;
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
