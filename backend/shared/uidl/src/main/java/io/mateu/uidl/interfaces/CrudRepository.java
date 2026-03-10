package io.mateu.uidl.interfaces;

import java.util.List;
import java.util.Optional;

public interface CrudRepository<T extends SimpleEntity> {
  Optional<T> findById(String id);

  String save(T entity);

  List<T> findAll();

  void deleteAllById(List<String> selectedIds);
}
