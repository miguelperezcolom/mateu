package io.mateu.uidl.interfaces;

public interface CrudCreationForm<IdType> {

  IdType create(HttpRequest httpRequest);
}
