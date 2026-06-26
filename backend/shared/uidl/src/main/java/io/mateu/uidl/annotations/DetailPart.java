package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a field of a {@code MasterDetailView} orchestrator as a <b>detail part</b>: a subpage shown
 * on demand in the detail pane when its button is clicked. Fields without this annotation make up
 * the always-visible master pane.
 *
 * <p>Example:
 *
 * <pre>{@code
 * @DetailPart(label = "Folios", order = 5) @Section(zone = "detail") @Inline
 * FoliosSection folios = new FoliosSection();
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface DetailPart {

  /** Button caption. Defaults to the field name when empty. */
  String label() default "";

  /** Stable key used in the route + button action id. Defaults to the field name when empty. */
  String key() default "";

  /** Ordering of the button in the bar (lower first). */
  int order() default 0;
}
