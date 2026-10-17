package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Puts a field of an {@link App} class in the application menu. What the field holds decides the
 * entry: a screen type (or instance) is a navigable page, a {@code String} is a route, a nested
 * class whose fields are {@code @Menu}s is a submenu, a {@code RemoteMenu} pulls another service's
 * menu, and a {@code Rule} runs instead of navigating. The label is the field name, humanised,
 * unless {@code @Label} says otherwise.
 *
 * <pre>{@code
 * @Menu Customers customers;           // a page
 * @Menu String reports = "/reports";  // a route
 * @Menu Sales sales;                   // a submenu (a class with @Menu fields)
 * }</pre>
 *
 * @see App
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Documented
public @interface Menu {

  /** Marks the entry as the selected one when the app opens. */
  boolean selected() default false;

  /**
   * What the entry is about: shown to AI assistants and, when the entry is a CARD of a group with
   * {@code display = cards}, as the card's text.
   */
  String description() default "";

  /**
   * How a GROUP shows its entries when it opens: {@code list} (default) or {@code cards} — a panel
   * of cards with each entry's title, description, icon/image and its own children as actions.
   */
  @Experimental("card menus (3.0-alpha.409)")
  io.mateu.uidl.data.MenuDisplay display() default io.mateu.uidl.data.MenuDisplay.list;

  /** An image for the entry's card (a URL, relative to the app, or a data URI). */
  @Experimental("card menus (3.0-alpha.409)")
  String image() default "";
}
