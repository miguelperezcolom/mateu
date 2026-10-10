package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Menu {

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
  io.mateu.uidl.data.MenuDisplay display() default io.mateu.uidl.data.MenuDisplay.list;

  /** An image for the entry's card (a URL, relative to the app, or a data URI). */
  String image() default "";
}
