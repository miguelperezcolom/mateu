package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

public interface CompositionRepository<EntityType, ParentIdType, IdType> extends Repository<EntityType, IdType> {

    ListingData<EntityType> search(String searchText, ParentIdType parentId, Pageable pageable);

}
