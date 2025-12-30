package com.example.demo.ddd.domain.hotel.world;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DestinationIdOptionsSupplier implements ForeignKeyOptionsSupplier {

    final DestinationRepository destinationRepository;

    @Override
    public ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest) {
        var found = destinationRepository.findAll();
        return new ListingData<>(new Page<>(
                searchText,
                found.size(),
                0,
                found.size(),
                found.stream().map(destination -> new Option(destination.code(), destination.name())).toList()));
    }
}
