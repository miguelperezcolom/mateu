package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

/**
 * A {@link CrudStore} for entities that are children of a parent (a composition/master-detail
 * relationship). Beyond the standard CRUD operations it adds a parent-scoped {@link #search(String,
 * Named, Object, Pageable)} that filters the listing to the rows belonging to {@code parentId}.
 *
 * @param <EntityType> the child entity type (must be {@link Named})
 * @param <ParentIdType> the type of the owning parent's id
 */
public interface CompositionCrudStore<EntityType extends Named, ParentIdType>
    extends CrudStore<EntityType> {

  ListingData<EntityType> search(
      String searchText, EntityType filters, ParentIdType parentId, Pageable pageable);
}
