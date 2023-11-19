package io.mateu.mdd.shared.interfaces;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.shared.SlimHelper;
import io.mateu.mdd.shared.annotations.Caption;
import java.lang.reflect.ParameterizedType;
import java.util.List;

import io.mateu.reflection.ReflectionHelper;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface Listing<SearchForm, Row> {

  Flux<Row> fetchRows(SearchForm filters, List<SortCriteria> sortOrders, int offset, int limit)
      throws Throwable;

  Mono<Long> fetchCount(SearchForm filters) throws Throwable;

  default String getCaption() {
    if (getClass().isAnnotationPresent(Caption.class)) {
      return getClass().getAnnotation(Caption.class).value();
    }
    try {
      if (!getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
        return toString();
      }
    } catch (NoSuchMethodException e) {
    }
    return SlimHelper.capitalize(getClass().getSimpleName());
  }

  default boolean showCheckboxForSelection(ReflectionHelper reflectionHelper) {
    return false;
  }

  default Class<SearchForm> getSearchFormClass() {
    return (Class<SearchForm>)
        ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[0];
  }

  default Class<Row> getRowClass() {
    return (Class<Row>)
        ((ParameterizedType) getClass().getGenericInterfaces()[0]).getActualTypeArguments()[1];
  }

  @JsonIgnore
  default List<Row> getSelection() {
    return new SelectedRowsContext().getRows();
  }

  @JsonIgnore
  default String getCaptionForEdit() {
    return "Edit";
  }
}
