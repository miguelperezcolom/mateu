package io.mateu.uidl.interfaces;

/**
 * @deprecated renamed to {@link CrudStore}. This is a data-access port (a thin adapter over your
 *     persistence), not a domain-aggregate repository — the name was reserved for that. Existing
 *     implementations keep working unchanged (this still IS a {@code CrudStore}); switch the type
 *     to {@link CrudStore} and {@code AutoCrud.repository()} to {@code store()} at your
 *     convenience.
 * @param <T> the entity type, which must be {@link Identifiable}
 */
@Deprecated(since = "3.0-alpha.257", forRemoval = true)
public interface CrudRepository<T extends Identifiable> extends CrudStore<T> {}
