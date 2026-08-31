package io.mateu.dtos;

import java.util.List;

/**
 * The bindable surface of a ModelView: the fields a layout can bind to (a {@code FormField id} must
 * name one) and the actions it can trigger (a {@code Button actionId} must name one). Derived from
 * the same reflective mapping the real UI uses, so it is the single source of truth for validating
 * a YAML/visual layout against its ModelView (the visual-builder plugin, codegen, etc.).
 *
 * @param modelView the ModelView class' fully-qualified name
 * @param fields the bindable fields, in declaration order, de-duplicated by id
 * @param actions the bindable action ids
 */
public record ModelViewContractDto(String modelView, List<Field> fields, List<Action> actions) {

  /**
   * A bindable field.
   *
   * @param id the field id a {@code FormField} binds to
   * @param dataType the wire data type (string, integer, number, date, dateTime, time, bool, …)
   * @param stereotype how it is painted (combobox, select, radio, money, plainText, …)
   * @param label the default label
   * @param required whether it is required
   * @param readOnly whether it is read-only
   */
  public record Field(
      String id,
      String dataType,
      String stereotype,
      String label,
      boolean required,
      boolean readOnly) {}

  /**
   * A bindable action.
   *
   * @param id the action id a {@code Button} triggers
   */
  public record Action(String id) {}
}
