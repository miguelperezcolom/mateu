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
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.Option;
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
    var filtersClass = getFiltersClass(instance);
    Collection<FormField> filters =
        filtersClass == null
            ? List.of()
            : getFilters(
                filtersClass,
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
            .groupBy(
                io.mateu.core.infra.declarative.orchestrators.crud.ListingSummarySpec.of(
                        getRowClass(instance))
                    .groupBy())
            .filters(filters)
            .columns(
                withViewOnFirstColumnIfNavigable(
                    instance,
                    getColumns(
                        getRowClass(instance),
                        instance,
                        baseUrl,
                        route,
                        initiatorComponentId,
                        httpRequest)))
            .filtersLayout(filtersLayout)
            .gridLayout(getGridLayout(instance))
            .style(getStyle(instance, httpRequest));

    // @GroupAction methods become buttons on the @GroupBy group header rows; the frontend
    // dispatches them as row actions carrying the group value in _groupValue.
    for (var method : instance.getClass().getMethods()) {
      var groupAction = MetaAnnotations.find(method, io.mateu.uidl.annotations.GroupAction.class);
      if (groupAction != null) {
        builder.groupAction(new Button(groupAction.value(), method.getName()));
      }
    }

    getToolbarButtons(instance).forEach(builder::toolbarItem);

    return List.of(builder.build());
  }

  /**
   * A declarative listing whose backend answers the {@code view} action is NAVIGABLE: the first
   * column carries {@code actionId="view"} so every renderer makes the row open the record — the
   * same signal {@code ListRouteResolver.withViewOnFirstColumn} emits on the AutoCrud path.
   * Selectors keep their own {@code select} semantics and are excluded.
   */
  private static Collection<? extends GridContent> withViewOnFirstColumnIfNavigable(
      Object instance, Collection<? extends GridContent> rawColumns) {
    if (!(instance instanceof io.mateu.uidl.interfaces.Listing<?> listing)
        || instance instanceof Selector<?>
        || !listing.supportsAction("view")) {
      return rawColumns;
    }
    var list = new java.util.ArrayList<GridContent>(rawColumns);
    if (list.isEmpty() || !(list.get(0) instanceof io.mateu.uidl.data.GridColumn first)) {
      return rawColumns;
    }
    list.set(0, first.toBuilder().actionId("view").build());
    return list;
  }

  /**
   * The listing's toolbar buttons: {@code @ListToolbarButton} methods (label from {@code @Label},
   * actionId = the method name — same annotation the Crud path honors) plus the built-in
   * import/history/export entries. Shared by the crud metadata AND the routed listing's PAGE
   * toolbar (the page header shows title + toolbar on one line; the crud suppresses its copy).
   */
  public static List<Button> getToolbarButtons(Object instance) {
    var buttons = new java.util.ArrayList<Button>();
    for (var method : getAllMethods(instance.getClass())) {
      if (MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.ListToolbarButton.class)) {
        var label = MetaAnnotations.find(method, io.mateu.uidl.annotations.Label.class);
        buttons.add(new Button(label != null ? label.value() : method.getName(), method.getName()));
      }
    }
    if (instance instanceof io.mateu.uidl.interfaces.UploadEnabled) {
      buttons.add(new Button("Import", "import"));
    }
    if (instance instanceof io.mateu.uidl.interfaces.Auditable) {
      buttons.add(new Button("History", "history"));
    }
    if (instance instanceof io.mateu.uidl.interfaces.Listing<?> listing) {
      if (listing.csvExportable() && ExporterContext.isCsvAvailable()) {
        buttons.add(new Button("Export CSV", "export-csv"));
      }
      if (listing.excelExportable() && ExporterContext.isExcelAvailable()) {
        buttons.add(new Button("Export Excel", "export-excel"));
      }
      if (listing.pdfExportable() && ExporterContext.isPdfAvailable()) {
        buttons.add(new Button("Export PDF", "export-pdf"));
      }
    }
    return buttons;
  }

  private static GridLayout getGridLayout(Object instance) {
    if (instance instanceof io.mateu.uidl.interfaces.Listing<?> listing) {
      return listing.gridLayout();
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
    if (instance instanceof io.mateu.uidl.interfaces.Listing<?> listing) {
      return listing.selectionEnabled();
    }
    if (instance instanceof ReactiveListing<?> reactiveListing) {
      return reactiveListing.selectionEnabled();
    }
    if (instance != null) {
      return getAllMethods(instance.getClass()).stream()
          .anyMatch(method -> MetaAnnotations.isPresent(method, Toolbar.class));
    }
    return false;
  }

  private static boolean isSearchable(Object instance) {
    return instance instanceof Searchable;
  }

  private static Class getRowClass(Object instance) {
    if (instance instanceof ReactiveListing<?> reactiveListing) {
      return reactiveListing.rowClass();
    }
    return getGenericClass(instance.getClass(), io.mateu.uidl.interfaces.Listing.class, "Row");
  }

  /** The filters type comes from the {@link Filterable} capability; null = no filter bar. */
  private static Class getFiltersClass(Object instance) {
    if (instance instanceof Filterable<?> filterable) {
      return filterable.filtersClass();
    }
    return null;
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
                    && (!Collection.class.isAssignableFrom(field.getType())
                        || FilterStateAssembler.enumSetElementType(field) != null))
        .map(
            field -> {
              FormField formField;
              if (isTypedFilter(field)) {
                formField = buildTypedFilterField(field, instance, httpRequest);
              } else {
                formField =
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
                  } else if (io.mateu.core.infra.declarative.orchestrators.crud
                      .FilterCriteriaBuilder.isRangeAnnotatedNumeric(field)) {
                    formField =
                        formField.toBuilder().stereotype(FieldStereotype.numberRange).build();
                  } else if (field.getType().isEnum()) {
                    formField =
                        formField.toBuilder().stereotype(FieldStereotype.multiSelect).build();
                  }
                }
              }
              if (MetaAnnotations.isPresent(field, MainFilter.class)) {
                return formField.toBuilder().mainFilter(true).build();
              }
              return formField;
            })
        .toList();
  }

  /**
   * A TYPED filter field ({@link DateRange}, {@link NumberRange}, {@code Set<SomeEnum>}) gets its
   * range/multi-select widget on ANY listing — the type is the developer's explicit ask, unlike the
   * crud-semantics inference which only applies on the AutoCrud path. These types would confuse the
   * standard form-field mapper (a record field becomes a nested form), so the filter FormField is
   * built directly: the smart search bar only needs id, label, stereotype and (for multi-selects)
   * the options.
   */
  private static boolean isTypedFilter(Field field) {
    return DateRange.class.equals(field.getType())
        || NumberRange.class.equals(field.getType())
        || FilterStateAssembler.enumSetElementType(field) != null;
  }

  private static FormField buildTypedFilterField(
      Field field, Object instance, HttpRequest httpRequest) {
    FieldStereotype stereotype;
    FieldDataType dataType;
    List<Option> options = List.of();
    if (DateRange.class.equals(field.getType())) {
      stereotype = FieldStereotype.dateRange;
      dataType = FieldDataType.date;
    } else if (NumberRange.class.equals(field.getType())) {
      stereotype = FieldStereotype.numberRange;
      dataType = FieldDataType.number;
    } else {
      stereotype = FieldStereotype.multiSelect;
      dataType = FieldDataType.string;
      options = FieldMetadataExtractor.getOptions(field, instance, httpRequest);
      if (options.isEmpty()) {
        options =
            FieldMetadataExtractor.enumOptions(FilterStateAssembler.enumSetElementType(field));
      }
    }
    return FormField.builder()
        .id(field.getName())
        .label(FieldMetadataExtractor.getLabel(field, instance, httpRequest))
        .dataType(dataType)
        .stereotype(stereotype)
        .options(options)
        .build();
  }

  private static boolean filterFilterField(Field field, Object instance, HttpRequest httpRequest) {
    var valid = FormFieldFilter.filterField(field, false, false, instance, httpRequest);
    if (valid) {
      // enums are filterable too (they render as a select with the enum options) — isBasic
      // doesn't know them, and dropping them here left e.g. status filters silently missing;
      // same for the explicit typed filters (DateRange/NumberRange/Set-of-enum)
      if (!isBasic(field.getType()) && !field.getType().isEnum() && !isTypedFilter(field)) {
        return false;
      }
    }
    return valid;
  }
}
