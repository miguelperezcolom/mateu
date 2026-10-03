package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper;
import io.mateu.core.infra.declarative.orchestrators.crud.FilterCriteriaBuilder;
import io.mateu.core.infra.declarative.orchestrators.crud.FilteredAutoCrud;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ListingDescriptorDto;
import io.mateu.dtos.ListingFilterDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.FilterStateAssembler;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.IdSetFilter;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * The URL a menu entry's listing can be narrowed by, read off its class without instantiating it:
 * every declared filter by its field name, the free-text search and the reserved {@code ids}
 * id-set. It rides on the menu ({@code MenuOptionDto.listing}) so a client that only has the menu —
 * the chat assistant — can open a listing already filtered, or showing a concrete set of rows, from
 * any screen.
 *
 * <p>The params are exactly what the renderers restore from the URL and send back as the listing's
 * state: a {@code Crud} (any of them, hand-written included) splits temporals into {@code
 * <field>_from}/{@code <field>_to} ranges and reads enums as comma-joined multi-values; a plain
 * {@code Listing} keeps single values except for the explicitly typed filters ({@link DateRange},
 * {@link NumberRange}, {@code Set<Enum>}).
 */
final class ListingDescriptorBuilder {

  private static final Set<Class<?>> NUMBERS =
      Set.of(
          int.class,
          long.class,
          double.class,
          float.class,
          short.class,
          Integer.class,
          Long.class,
          Double.class,
          Float.class,
          Short.class,
          BigDecimal.class);

  /** The descriptor of the screen {@code type} opens, or null when it is not a listing. */
  static ListingDescriptorDto describe(Class<?> type) {
    if (type == null) {
      return null;
    }
    try {
      Class<?> rowClass;
      Class<?> filtersClass;
      boolean searchable;
      boolean crudSemantics;
      if (FilteredAutoCrud.class.isAssignableFrom(type)) {
        rowClass = getGenericClass(type, FilteredAutoCrud.class, "T");
        filtersClass = rowClass;
        searchable = true;
        crudSemantics = true;
      } else if (Crud.class.isAssignableFrom(type)) {
        rowClass = getGenericClass(type, Crud.class, "Row");
        filtersClass = getGenericClass(type, Crud.class, "Filters");
        searchable = true;
        crudSemantics = true;
      } else if (Listing.class.isAssignableFrom(type)) {
        rowClass = getGenericClass(type, Listing.class, "Row");
        filtersClass =
            Filterable.class.isAssignableFrom(type)
                ? getGenericClass(type, Filterable.class, "Filters")
                : null;
        searchable = Searchable.class.isAssignableFrom(type);
        // a listing the framework bridges into a crud (it declares Navigable/Editable/…) is
        // searched through the crud engine: its temporals and enums are ranges and multi-values
        crudSemantics =
            !io.mateu.uidl.interfaces.RouteHandler.class.isAssignableFrom(type)
                && (io.mateu.uidl.interfaces.Navigable.class.isAssignableFrom(type)
                    || io.mateu.uidl.interfaces.Editable.class.isAssignableFrom(type)
                    || io.mateu.uidl.interfaces.Creatable.class.isAssignableFrom(type)
                    || io.mateu.uidl.interfaces.Deletable.class.isAssignableFrom(type));
      } else {
        return null;
      }
      return ListingDescriptorDto.builder()
          .idField(idField(type, rowClass))
          .idsParam(SearchRequest.IDS)
          .searchParam(searchable ? "searchText" : null)
          .filters(filters(filtersClass, crudSemantics))
          .build();
    } catch (RuntimeException | LinkageError e) {
      // describing is a courtesy to the menu: a listing we cannot read still opens
      return null;
    }
  }

  private static String idField(Class<?> type, Class<?> rowClass) {
    if (rowClass == null || Object.class.equals(rowClass)) {
      return "id";
    }
    if (Crud.class.isAssignableFrom(type)) {
      return CrudAdapterHelper.getIdField(rowClass);
    }
    return IdSetFilter.idFieldOf(rowClass);
  }

  private static List<ListingFilterDto> filters(Class<?> filtersClass, boolean crudSemantics) {
    if (filtersClass == null
        || Object.class.equals(filtersClass)
        || java.util.Map.class.isAssignableFrom(filtersClass)) {
      return List.of();
    }
    var filters = new ArrayList<ListingFilterDto>();
    for (Field field : getAllFields(filtersClass)) {
      if (Modifier.isStatic(field.getModifiers())
          || MetaAnnotations.isPresent(field, Hidden.class)) {
        continue;
      }
      var filter = filter(field, crudSemantics);
      if (filter != null) {
        filters.add(filter);
      }
    }
    return filters;
  }

  private static ListingFilterDto filter(Field field, boolean crudSemantics) {
    var name = field.getName();
    var builder =
        ListingFilterDto.builder().param(name).label(FieldMetadataExtractor.getLabel(field));
    var type = field.getType();
    var enumSet = FilterStateAssembler.enumSetElementType(field);
    if (DateRange.class.equals(type) || (crudSemantics && FilterCriteriaBuilder.isTemporal(type))) {
      return builder
          .type(LocalDateTime.class.equals(type) ? "dateTimeRange" : "dateRange")
          .fromParam(name + "_from")
          .toParam(name + "_to")
          .build();
    }
    if (NumberRange.class.equals(type)
        || (crudSemantics && FilterCriteriaBuilder.isRangeAnnotatedNumeric(field))) {
      return builder.type("numberRange").fromParam(name + "_from").toParam(name + "_to").build();
    }
    if (enumSet != null) {
      return builder.type("enum").multiple(true).values(constants(enumSet)).build();
    }
    if (type.isEnum()) {
      return builder.type("enum").multiple(crudSemantics).values(constants(type)).build();
    }
    if (String.class.equals(type)) {
      return builder.type("text").build();
    }
    if (boolean.class.equals(type) || Boolean.class.equals(type)) {
      return builder.type("boolean").build();
    }
    if (NUMBERS.contains(type)) {
      return builder.type("number").build();
    }
    if (LocalDate.class.equals(type)) {
      return builder.type("date").build();
    }
    if (LocalDateTime.class.equals(type)) {
      return builder.type("dateTime").build();
    }
    return null;
  }

  private static List<String> constants(Class<?> enumType) {
    return Arrays.stream(enumType.getEnumConstants()).map(c -> ((Enum<?>) c).name()).toList();
  }

  private ListingDescriptorBuilder() {}
}
