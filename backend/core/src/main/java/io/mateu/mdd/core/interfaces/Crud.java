package io.mateu.mdd.core.interfaces;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Serializer;

import java.util.List;
import java.util.Map;

public interface Crud<SearchForm, Row> extends Listing<SearchForm, Row> {

  @Override
  default boolean showCheckboxForSelection(ReflectionHelper reflectionHelper) {
    return !reflectionHelper.getMethod(getClass(), "delete").getDeclaringClass().isInterface();
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
