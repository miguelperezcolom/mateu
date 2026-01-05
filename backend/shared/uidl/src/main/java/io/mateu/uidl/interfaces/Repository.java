package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

import java.util.List;
import java.util.Optional;

public interface Repository<EntityType, IdType> {

    void saveAll(List<EntityType> entities);

    List<EntityType> findAll();

    Optional<EntityType> findById(IdType id);

    ListingData<EntityType> search(String searchText, Pageable pageable);

    void deleteAllById(List<IdType> selectedIds);
}
