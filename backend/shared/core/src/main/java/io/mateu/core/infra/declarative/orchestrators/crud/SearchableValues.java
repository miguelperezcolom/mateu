package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.SearchableSelection;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

/**
 * The values of a {@code @Searchable} field and their labels — single-valued (an id) or
 * multi-valued (a {@code List}, {@code Set} or array of ids). The labels come from the field's
 * {@code label()} supplier (or the view model, when it is a {@link LookupLabelSupplier}); an id
 * with no label shows as itself.
 */
@Slf4j
public final class SearchableValues {

  private SearchableValues() {}

  /** Whether {@code field} is a {@code @Searchable} holding several ids. */
  public static boolean isMultiValued(Field field) {
    return field != null
        && MetaAnnotations.isPresent(field, Searchable.class)
        && (Collection.class.isAssignableFrom(field.getType()) || field.getType().isArray());
  }

  /** The ids the field holds in {@code owner}, in order, without nulls. */
  public static List<Object> idsOf(Field field, Object owner) {
    var out = new ArrayList<Object>();
    var value = owner != null ? getValue(field, owner) : null;
    if (value instanceof Collection<?> collection) {
      collection.stream().filter(java.util.Objects::nonNull).forEach(out::add);
    } else if (value != null && value.getClass().isArray()) {
      for (int i = 0; i < Array.getLength(value); i++) {
        var id = Array.get(value, i);
        if (id != null) {
          out.add(id);
        }
      }
    }
    return out;
  }

  /** {@code {id → label}} for {@code ids}, in their order. */
  public static Map<String, String> labelsOf(
      Field field, Object owner, List<Object> ids, HttpRequest httpRequest) {
    var labels = new LinkedHashMap<String, String>();
    if (ids.isEmpty()) {
      return labels;
    }
    var supplier = labelSupplier(field, owner);
    for (var id : ids) {
      labels.put(String.valueOf(id), labelOf(supplier, field, id, httpRequest));
    }
    return labels;
  }

  /**
   * Writes the labels of a {@code @Searchable} field into the component data: {@code f-label} (the
   * display text — the labels joined by ", " for a multi-valued field) and, for a multi-valued
   * field, {@code f-labels} = {@code {id → label}} (the chips).
   */
  static void writeData(
      Field field, Object item, Map<String, Object> data, HttpRequest httpRequest) {
    if (isMultiValued(field)) {
      var labels = labelsOf(field, item, idsOf(field, item), httpRequest);
      data.put(field.getName() + SearchableSelection.LABELS_SUFFIX, labels);
      data.put(
          field.getName() + SearchableSelection.LABEL_SUFFIX, String.join(", ", labels.values()));
      return;
    }
    var id = getValue(field, item);
    if (id != null && !"".equals(id)) {
      data.put(
          field.getName() + SearchableSelection.LABEL_SUFFIX,
          labelOf(labelSupplier(field, item), field, id, httpRequest));
    }
  }

  private static LookupLabelSupplier labelSupplier(Field field, Object owner) {
    try {
      var supplier = LookupSupplierResolver.getLookupLabelSupplier(owner, field);
      if (supplier != null) {
        return supplier;
      }
      // no label= and the view model labels nothing: a selector that is also a label supplier
      // (the usual Listing + Selector + LookupLabelSupplier) labels its own ids
      var selectorType = MetaAnnotations.find(field, Searchable.class).selector();
      if (selectorType != null && LookupLabelSupplier.class.isAssignableFrom(selectorType)) {
        return (LookupLabelSupplier) LookupSupplierResolver.getSelector(owner, field);
      }
      return null;
    } catch (RuntimeException e) {
      log.warn("No label supplier for @Searchable field {}", field.getName(), e);
      return null;
    }
  }

  private static String labelOf(
      LookupLabelSupplier supplier, Field field, Object id, HttpRequest httpRequest) {
    if (supplier != null) {
      try {
        var label = supplier.label(field.getName(), id, httpRequest);
        if (label != null) {
          return label;
        }
      } catch (RuntimeException e) {
        log.debug("Label resolution failed for field {} and id {}", field.getName(), id, e);
      }
    }
    return String.valueOf(id);
  }
}
