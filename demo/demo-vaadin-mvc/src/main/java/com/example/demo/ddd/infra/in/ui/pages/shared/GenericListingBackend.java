package com.example.demo.ddd.infra.in.ui.pages.shared;

import com.example.demo.ddd.domain.hotel.shared.Repository;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;

public abstract class GenericListingBackend<EntityType> implements ListingBackend<NoFilters, EntityType> {


    @Override
    public ListingData<EntityType> search(String searchText, NoFilters noFilters, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(repository().findAll()
                //.stream()
                //.map(entity -> new GenericRow(entity.id(), entity.name()))
                //.toList()
        );
    }

    public abstract Repository<EntityType, String> repository();
}
