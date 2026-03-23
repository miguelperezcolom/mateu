package io.mateu.mdd.specdrivengenerator.application.shared;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

import java.util.Optional;

public interface QueryService<DtoType, RowType, IdType> {

    ListingData<RowType> findAll(String searchText,
                                 Object filters, Pageable pageable);

    String getLabel(IdType id);

    Optional<DtoType> getById(IdType id);

}