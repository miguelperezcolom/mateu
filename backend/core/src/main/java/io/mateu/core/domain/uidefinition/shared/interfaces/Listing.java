package io.mateu.core.domain.uidefinition.shared.interfaces;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionHelper;

import java.awt.*;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.Arrays;
import java.util.List;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Mono;

public interface Listing<FiltersForm, Row> {

  default boolean isSearchable() {
    return true;
  }

  Mono<Page<Row>> fetchRows(String searchText, FiltersForm filters, Pageable pageable)
      throws Throwable;

  default boolean showCheckboxForSelection(ReflectionHelper reflectionHelper) {
    return reflectionHelper.getAllMethods(getClass()).stream()
            .filter(m -> m.isAnnotationPresent(Action.class))
            .anyMatch(m -> hasSelectionParameter(m, reflectionHelper));
  }

  default boolean hasSelectionParameter(Method m, ReflectionHelper reflectionHelper) {
    return Arrays.stream(m.getGenericParameterTypes())
            .filter(t -> t instanceof ParameterizedType)
            .map(t -> (ParameterizedType) t)
            .anyMatch(type ->
                    type.getRawType().equals(getRowClass())
                    || (
                    List.class.equals(type.getRawType())
                            && reflectionHelper.getGenericClass(type, List.class, "E")
                            .equals(getRowClass())
                    )
            );
  }

  default boolean hasActionOnSelectedRow(ReflectionHelper reflectionHelper) {
    return reflectionHelper.getAllMethods(this.getClass()).stream()
            .filter(m -> m.isAnnotationPresent(Action.class))
            .flatMap(m -> Arrays.stream(m.getGenericParameterTypes()))
            .anyMatch(type ->
                    type.equals(getRowClass())
            );
  }

  default Class<FiltersForm> getSearchFormClass() {
    return (Class<FiltersForm>) getActualTypeArgument(getClass(), 0);
  }

  default Class getActualTypeArgument(Class type, int index) {
    if (type.getGenericInterfaces().length == 0) {
      if (type.getSuperclass() != null) {
        return getActualTypeArgument(type.getSuperclass(), index);
      }
      return null;
    }
    var parameterizedType = ((ParameterizedType) type.getGenericInterfaces()[0]);
    if (parameterizedType.getActualTypeArguments().length <= index) {
      if (type.getSuperclass() != null) {
        return getActualTypeArgument(type.getSuperclass(), index);
      }
      return null;
    }
    return (Class) parameterizedType.getActualTypeArguments()[index];
  }

  default Class<Row> getRowClass() {
    return (Class<Row>) getActualTypeArgument(getClass(), 1);
  }


  @JsonIgnore
  default String getCaptionForEdit() {
    return "Edit";
  }

  default Object onRowSelected(Row row) throws Throwable {
    return null;
  }
}
