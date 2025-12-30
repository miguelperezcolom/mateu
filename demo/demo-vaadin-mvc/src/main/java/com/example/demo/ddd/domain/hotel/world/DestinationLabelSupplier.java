package com.example.demo.ddd.domain.hotel.world;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DestinationLabelSupplier implements LabelSupplier {

    final DestinationRepository destinationRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return destinationRepository.findById((String) id)
                .map(Destination::name)
                .orElse("No destination with id " + id);
    }
}
