package io.mateu.uidl.interfaces;

/**
 * A form used to edit an existing CRUD entity. {@link #save(HttpRequest)} persists the changes from
 * the submitted form state, and {@link #id()} returns the id of the entity being edited.
 *
 * @param <IdType> the entity id type
 */
public interface CrudEditorForm<IdType> {

  void save(HttpRequest httpRequest);

  IdType id();
}
