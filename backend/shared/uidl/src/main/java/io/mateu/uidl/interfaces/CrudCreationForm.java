package io.mateu.uidl.interfaces;

/**
 * A form used to create a new CRUD entity. {@link #create(HttpRequest)} persists the new record
 * from the submitted form state and returns the id of the created entity.
 *
 * @param <IdType> the entity id type
 */
public interface CrudCreationForm<IdType> {

  IdType create(HttpRequest httpRequest);
}
