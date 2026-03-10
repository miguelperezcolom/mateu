package io.mateu.uidl.interfaces;

public interface CrudEditorForm<IdType> {

  void save(HttpRequest httpRequest);

  IdType id();
}
