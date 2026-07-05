package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.core.infra.reflection.read.TypeCoercionHelper;
import io.mateu.uidl.annotations.RangeFilter;
import io.mateu.uidl.data.FilterCriterion;
import io.mateu.uidl.data.FilterOperator;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Splits a crud search's component state into the conditions query-by-example can't hold and the
 * plain equality values it can. Ranges arrive as {@code <field>_from}/{@code <field>_to} keys and
 * multi-selects as value lists (or comma-joined strings when restored from the URL); both become
 * {@link FilterCriterion} entries with the values coerced to the field's type, and their keys are
 * REMOVED from the returned example state — hydrating a list into an enum field (or leaving {@code
 * _from} keys around) would break the example object. A single bare string on an enum key stays in
 * the state on purpose: it keeps filtering by equality through the example, which is what older
 * clients send.
 */
public class FilterCriteriaBuilder {

  private static final Set<Class<?>> TEMPORAL_TYPES =
      Set.of(LocalDate.class, LocalDateTime.class, LocalTime.class);

  private static final Set<Class<?>> NUMERIC_TYPES =
      Set.of(
          int.class,
          long.class,
          float.class,
          double.class,
          short.class,
          byte.class,
          Integer.class,
          Long.class,
          Float.class,
          Double.class,
          Short.class,
          Byte.class,
          BigDecimal.class);

  public record ExtractedCriteria(
      List<FilterCriterion> criteria, Map<String, Object> exampleState) {}

  /** Temporal filter fields render as from/to ranges without any annotation. */
  public static boolean isTemporal(Class<?> type) {
    return TEMPORAL_TYPES.contains(type);
  }

  /** Numeric filter fields render as min/max ranges when annotated with {@code @RangeFilter}. */
  public static boolean isRangeAnnotatedNumeric(Field field) {
    return NUMERIC_TYPES.contains(field.getType())
        && MetaAnnotations.isPresent(field, RangeFilter.class);
  }

  public static ExtractedCriteria extract(
      Class<?> filtersClass, Map<String, Object> componentState) {
    if (componentState == null || componentState.isEmpty() || filtersClass == null) {
      return new ExtractedCriteria(List.of(), componentState == null ? Map.of() : componentState);
    }
    var state = new HashMap<>(componentState);
    var criteria = new ArrayList<FilterCriterion>();
    for (Field field : getAllFields(filtersClass)) {
      if (isTemporal(field.getType()) || isRangeAnnotatedNumeric(field)) {
        var from = coerce(field.getType(), state.remove(field.getName() + "_from"));
        var to = coerce(field.getType(), state.remove(field.getName() + "_to"));
        if (from != null && to != null) {
          criteria.add(
              new FilterCriterion(field.getName(), FilterOperator.between, List.of(from, to)));
        } else if (from != null) {
          criteria.add(new FilterCriterion(field.getName(), FilterOperator.gte, List.of(from)));
        } else if (to != null) {
          criteria.add(new FilterCriterion(field.getName(), FilterOperator.lte, List.of(to)));
        }
      } else if (field.getType().isEnum()) {
        var names = multiValues(state.get(field.getName()));
        if (names != null) {
          state.remove(field.getName());
          var values =
              names.stream()
                  .map(name -> coerce(field.getType(), name))
                  .filter(value -> value != null)
                  .map(value -> (Object) value)
                  .toList();
          if (!values.isEmpty()) {
            criteria.add(new FilterCriterion(field.getName(), FilterOperator.in, values));
          }
        }
      }
    }
    return new ExtractedCriteria(List.copyOf(criteria), state);
  }

  /**
   * A multi-select value is a list (live client) or a comma-joined string (URL restore). A single
   * bare string returns null so it keeps flowing through the example object as plain equality.
   */
  private static List<String> multiValues(Object raw) {
    if (raw instanceof List<?> list) {
      return list.stream().map(String::valueOf).filter(value -> !value.isBlank()).toList();
    }
    if (raw instanceof String text && text.contains(",")) {
      return Arrays.stream(text.split(",")).map(String::trim).filter(v -> !v.isBlank()).toList();
    }
    return null;
  }

  private static Object coerce(Class<?> type, Object value) {
    if (value == null || (value instanceof String text && text.isBlank())) {
      return null;
    }
    try {
      return TypeCoercionHelper.getActualValue(type, value, null, null);
    } catch (Exception e) {
      // an unparseable bound is treated as unset rather than blowing up the search
      return null;
    }
  }
}
