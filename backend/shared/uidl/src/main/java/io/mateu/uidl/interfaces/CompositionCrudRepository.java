package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

public interface CompositionCrudRepository<EntityType extends SimpleEntity, ParentIdType>
    extends CrudRepository<EntityType> {

  ListingData<EntityType> search(
      String searchText, EntityType filters, ParentIdType parentId, Pageable pageable);
}
