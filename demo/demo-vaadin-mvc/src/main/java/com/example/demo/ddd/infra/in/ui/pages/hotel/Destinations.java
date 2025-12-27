package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.shared.Repository;
import com.example.demo.ddd.domain.hotel.world.Destination;
import com.example.demo.ddd.domain.hotel.world.DestinationRepository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericListingBackend;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
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
