package io.mateu.core.domain.uidefinitionlanguage.core.interfaces;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.Listing;
import java.util.List;
import java.util.Map;

public interface Crud<FiltersForm, Row> extends Listing<FiltersForm, Row> {

  @Override
  default boolean showCheckboxForSelection(ReflectionHelper reflectionHelper) {
    var hasAnyMethodWithSelectionAsParameter =
        reflectionHelper.getAllMethods(getClass()).stream()
            .filter(m -> m.isAnnotationPresent(Action.class))
            .anyMatch(m -> hasSelectionParameter(m, reflectionHelper));
    return hasAnyMethodWithSelectionAsParameter
        || !reflectionHelper.getMethod(getClass(), "delete").getDeclaringClass().isInterface();
  }

  @JsonIgnore
  default Object getNewRecordForm() throws Throwable {
    return null;
  }

  default Object getDetail(Row row) throws Throwable {
    return null;
  }

  default Object getRow(Map<String, Object> row, Serializer serializer) throws Throwable {
    return serializer.fromJson(serializer.toJson(row), getRowClass());
  }

  default void delete(List<Row> selection) throws Throwable {}

  @JsonIgnore
  default String getCaptionForNew() {
    return "New";
  }

  @JsonIgnore
  default String getCaptionForDelete() {
    return "Delete";
  }
}
