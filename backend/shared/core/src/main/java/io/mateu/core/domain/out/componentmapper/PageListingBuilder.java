package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getFormField;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.MainFilter;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FiltersLayout;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.interfaces.*;
import io.mateu.uidl.layout.FilterLayoutSelector;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;

public class PageListingBuilder {

  private static final FilterLayoutSelector FILTER_LAYOUT_SELECTOR = new FilterLayoutSelector();

  public static Collection<? extends Component> getCrud(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var filters =
        getFilters(
            getFiltersClass(instance),
            instance,
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
    FiltersLayout filtersLayout =
        FILTER_LAYOUT_SELECTOR.selectLayout(isSearchable(instance), filters.stream().toList(), 0);
    var builder =
        Listing.builder()
            .searchable(isSearchable(instance))
            .rowsSelectionEnabled(isRowSelectionEnabled(instance))
            .filters(filters)
            .columns(
                getColumns(
                    getRowClass(instance),
                    instance,
                    baseUrl,
                    route,
                    initiatorComponentId,
                    httpRequest))
            .filtersLayout(filtersLayout)
            .gridLayout(getGridLayout(instance))
            .style(getStyle(instance, httpRequest));

    if (instance instanceof io.mateu.uidl.interfaces.UploadEnabled) {
      builder.toolbarItem(new Button("Import", "import"));
    }
    if (instance instanceof io.mateu.uidl.interfaces.Auditable) {
      builder.toolbarItem(new Button("History", "history"));
    }
    if (instance instanceof io.mateu.core.infra.declarative.Listing<?, ?> listing) {
      if (listing.csvExportable() && ExporterContext.isCsvAvailable()) {
        builder.toolbarItem(new Button("Export CSV", "export-csv"));
      }
      if (listing.excelExportable() && ExporterContext.isExcelAvailable()) {
        builder.toolbarItem(new Button("Export Excel", "export-excel"));
      }
      if (listing.pdfExportable() && ExporterContext.isPdfAvailable()) {
        builder.toolbarItem(new Button("Export PDF", "export-pdf"));
      }
    }

    return List.of(builder.build());
  }

  private static GridLayout getGridLayout(Object instance) {
    if (instance instanceof ListingBackend<?, ?> listingBackend) {
      return listingBackend.gridLayout();
    }
    return GridLayout.auto;
  }

  private static String getStyle(Object instance, HttpRequest httpRequest) {
    var style = "min-width: 30rem; display: block;";
    if (MetaAnnotations.isPresent(instance.getClass(), Style.class)) {
      style += MetaAnnotations.find(instance.getClass(), Style.class).value();
    }
    return style;
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
          .anyMatch(method -> MetaAnnotations.isPresent(method, Toolbar.class));
    }
    return false;
  }

  private static boolean isSearchable(Object instance) {
    return true;
  }

  private static Class getRowClass(Object instance) {
    if (instance instanceof ReactiveListingBackend<?, ?>) {
      return getGenericClass(instance.getClass(), ReactiveListingBackend.class, "Row");
    }
    return getGenericClass(instance.getClass(), ListingBackend.class, "Row");
  }

  private static Class getFiltersClass(Object instance) {
    if (instance instanceof ReactiveListingBackend<?, ?>) {
      return getGenericClass(instance.getClass(), ReactiveListingBackend.class, "Filters");
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
    return ListingColumnBuilder.getColumns(
        rowClass, instance, baseUrl, route, initiatorComponentId, httpRequest);
  }

  public static Collection<FormField> getFilters(
      Class filtersClass,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return getFilters(
        filtersClass,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        false);
  }

  /**
   * With {@code crudFilterSemantics} (the AutoCrud listing path) filters get the richer widgets
   * whose values travel OUTSIDE the entity-shaped example object: temporals as from/to date ranges,
   * {@code @RangeFilter} numerics as min/max ranges, enums as multi-selects (IN). Plain declarative
   * Listings keep the classic single-value widgets — their custom Filters classes are hydrated
   * as-is and would not survive lists or {@code _from}/{@code _to} keys.
   */
  public static Collection<FormField> getFilters(
      Class filtersClass,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean crudFilterSemantics) {
    return getAllFields(filtersClass).stream()
        .filter(field -> filterFilterField(field, instance, httpRequest))
        .filter(
            field ->
                !ColumnActionGroup.class.equals(field.getType())
                    && !ColumnActionGroup.class.equals(field.getType())
                    && !Collection.class.isAssignableFrom(field.getType()))
        .map(
            field -> {
              var formField =
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
                          2,
                          0);
              if (crudFilterSemantics) {
                if (io.mateu.core.infra.declarative.orchestrators.crud.FilterCriteriaBuilder
                    .isTemporal(field.getType())) {
                  formField = formField.toBuilder().stereotype(FieldStereotype.dateRange).build();
                } else if (io.mateu.core.infra.declarative.orchestrators.crud.FilterCriteriaBuilder
                    .isRangeAnnotatedNumeric(field)) {
                  formField = formField.toBuilder().stereotype(FieldStereotype.numberRange).build();
                } else if (field.getType().isEnum()) {
                  formField = formField.toBuilder().stereotype(FieldStereotype.multiSelect).build();
                }
              }
              if (MetaAnnotations.isPresent(field, MainFilter.class)) {
                return formField.toBuilder().mainFilter(true).build();
              }
              return formField;
            })
        .toList();
  }

  private static boolean filterFilterField(Field field, Object instance, HttpRequest httpRequest) {
    var valid = FormFieldFilter.filterField(field, false, false, instance, httpRequest);
    if (valid) {
      // enums are filterable too (they render as a select with the enum options) — isBasic
      // doesn't know them, and dropping them here left e.g. status filters silently missing
      if (!isBasic(field.getType()) && !field.getType().isEnum()) {
        return false;
      }
    }
    return valid;
  }
}
