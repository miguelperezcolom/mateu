package io.mateu.uidl.interfaces;

/**
 * @deprecated renamed to {@link CompositionCrudStore}. Existing implementations keep working
 *     unchanged (this still IS a {@code CompositionCrudStore}); switch the type at your
 *     convenience.
 * @param <EntityType> the child entity type (must be {@link Named})
 * @param <ParentIdType> the type of the owning parent's id
 */
@Deprecated(since = "3.0-alpha.257", forRemoval = true)
public interface CompositionCrudRepository<EntityType extends Named, ParentIdType>
    extends CompositionCrudStore<EntityType, ParentIdType> {}
