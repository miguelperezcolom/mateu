package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Option;
import java.util.List;

/**
 * Supplies the fixed set of selectable {@link Option}s for a field (e.g. a combo/select). Implement
 * {@link #options(String, HttpRequest)} to return the choices for the field {@code fieldName};
 * override {@link #supports(Class, String, Class)} (default {@code true}) to restrict which fields
 * this supplier applies to. Unlike {@link LookupOptionsSupplier} this returns the whole list at
 * once rather than a searchable page.
 */
public interface OptionsSupplier {

  default boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
    return true;
  }
  ;

  List<Option> options(String fieldName, HttpRequest httpRequest);
}
