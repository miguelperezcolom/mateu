package com.example.demo.ddd.domain.hotel.shared;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Optional;

public interface Repository<EntityType, IdType> {

    void saveAll(List<EntityType> entities);

    List<EntityType> findAll();

    Optional<EntityType> findById(IdType id);

    ListingData<EntityType> search(String searchText, Pageable pageable);
}
