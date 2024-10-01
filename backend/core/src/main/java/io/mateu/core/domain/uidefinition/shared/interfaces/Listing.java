package io.mateu.core.domain.uidefinition.shared.interfaces;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.dtos.SortCriteria;
import java.lang.reflect.ParameterizedType;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface Listing<FiltersForm, Row> {

  default boolean isSearchable() {
    return true;
  }

  Flux<Row> fetchRows(String searchText, FiltersForm filters, List<SortCriteria> sortOrders, int offset, int limit)
      throws Throwable;

  Mono<Long> fetchCount(String searchText, FiltersForm filters) throws Throwable;

  default boolean showCheckboxForSelection(ReflectionHelper reflectionHelper) {
    return false;
  }

  default Class<FiltersForm> getSearchFormClass() {
    return (Class<FiltersForm>)
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
