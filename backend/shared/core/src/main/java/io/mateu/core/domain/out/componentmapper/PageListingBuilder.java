package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getFormField;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;

public class PageListingBuilder {

  static Collection<? extends Component> getCrud(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return List.of(
        Listing.builder()
            .searchable(isSearchable(instance))
            .rowsSelectionEnabled(isRowSelectionEnabled(instance))
            .filters(
                getFilters(
                    getFiltersClass(instance),
                    instance,
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .columns(
                getColumns(
                    getRowClass(instance),
                    instance,
                    baseUrl,
                    route,
                    initiatorComponentId,
                    httpRequest))
            .style("min-width: 30rem; display: block;")
            .build());
  }

  private static boolean isRowSelectionEnabled(Object instance) {
    if (instance instanceof ListingBackend<?, ?> listingBackend) {
      return listingBackend.selectionEnabled();
    }
    if (instance instanceof ReactiveListingBackend<?, ?> reactiveListingBackend) {
      return reactiveListingBackend.selectionEnabled();
    }
    if (instance != null) {
      return getAllMethods(instance.getClass()).stream()
          .anyMatch(method -> method.isAnnotationPresent(Toolbar.class));
    }
    return false;
  }

  private static boolean isSearchable(Object instance) {
    return true;
  }

  private static Class getRowClass(Object instance) {
    if (instance instanceof ReactiveListingBackend<?, ?>) {
      getGenericClass(instance.getClass(), ReactiveListingBackend.class, "Row");
    }
    return getGenericClass(instance.getClass(), ListingBackend.class, "Row");
  }

  private static Class getFiltersClass(Object instance) {
    if (instance instanceof ReactiveListingBackend<?, ?>) {
      getGenericClass(instance.getClass(), ReactiveListingBackend.class, "Filters");
    }
    return getGenericClass(instance.getClass(), ListingBackend.class, "Filters");
  }

  public static Collection<? extends GridContent> getColumns(
      Class rowClass,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return getAllFields(rowClass).stream()
        .filter(PageListingBuilder::filterColumn)
        .map(field -> getColumn(field, instance, baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static boolean filterColumn(Field field) {
    if (field.isAnnotationPresent(Hidden.class)) {
      return false;
    }
    if (field.isAnnotationPresent(HiddenInList.class)) {
      return false;
    }
    if (field.isAnnotationPresent(Menu.class)) {
      return false;
    }
    if (Collection.class.isAssignableFrom(field.getType())) {
      return false;
    }
    if (field.getType().isEnum()) {
      return true;
    }
    if (Status.class.equals(field.getType())) {
      return true;
    }
    if (Amount.class.equals(field.getType())) {
      return true;
    }
    return true;
  }

  private static GridColumn getColumn(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return GridColumn.builder()
        .id(field.getName())
        .label(getLabel(field))
        .dataType(getDataTypeForColumn(field))
        .stereotype(getStereotypeForColumn(field))
        .style(getColumnStyle(field))
        .build();
  }

  private static String getColumnStyle(AccessibleObject field) {
    if (field.isAnnotationPresent(Style.class)) {
      return field.getAnnotation(Style.class).value();
    }
    return "";
  }

  public static Collection<FormField> getFilters(
      Class filtersClass,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return getAllFields(filtersClass).stream()
        .filter(field -> false)
        .map(
            field ->
                (FormField)
                    getFormField(
                        field,
                        instance,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest,
                        false,
                        2))
        .toList();
  }
}
