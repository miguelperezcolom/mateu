package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Binds row selection of a grid field (a {@code List} field rendered with
 * {@code @Stereotype(FieldStereotype.grid)}) to a developer action.
 *
 * <p>When the user selects (clicks) a row, Mateu runs the named method on the class that declares
 * the grid field, injecting the selected row as a method parameter (see {@link
 * io.mateu.uidl.interfaces.HttpRequest#getClickedRow(Class)} — a parameter typed as the row class
 * is auto-injected). Unlike the built-in CRUD detail editing, this works on read-only grids too,
 * which makes it a natural way to drive a master/detail view: select a row, then emit an event or
 * update another part of the screen.
 *
 * <p>On the frontend, clicking anywhere on a row triggers the selection (the row is resolved from
 * the grid's click context, since a read-only grid does not reliably fire Vaadin's {@code
 * active-item-changed} on click); rows show a pointer cursor to signal they are selectable. The
 * action id is also auto-registered on the component so the dispatched event reaches the server.
 *
 * <pre>{@code
 * @OnRowSelected("onGuestSelected")
 * @Stereotype(FieldStereotype.grid)
 * List<GuestData> guests;
 *
 * Object onGuestSelected(GuestData guest, HttpRequest httpRequest) {
 *     return UICommand.dispatchEvent("pax-selected", Map.of("name", guest.getFirstName()));
 * }
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface OnRowSelected {

  /** Name of the action/method to run when a row is selected. */
  String value();
}
