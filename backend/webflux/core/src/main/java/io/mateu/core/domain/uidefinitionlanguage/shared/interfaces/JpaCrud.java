package io.mateu.core.domain.uidefinitionlanguage.shared.interfaces;

import java.util.List;

public interface JpaCrud<E> {

  default List<String> getSearchFilterFields() {
    return null;
  }

  default List<String> getColumnFields() {
    return null;
  }

  default List<String> getVisibleFields() {
    return null;
  }

  default List<String> getReadOnlyFields() {
    return null;
  }

  default String getExtraWhereFilter() {
    return null;
  }

  default boolean isReadOnly() {
    return false;
  }

  default boolean canAdd() {
    return true;
  }

  default boolean canDelete() {
    return true;
  }

  default Class getEntityClass() {
    return null;
  }
}
