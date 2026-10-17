package io.mateu.uidl.annotations;

import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Puts the annotated method (or action-holding field) as a button in the row BELOW the page's
 * content — the form's own buttons (Save, Cancel…). Its label is the method name humanised, or
 * {@code @Label}. Combine with {@link Action} to configure how it behaves.
 *
 * <pre>{@code
 * @Button
 * @Action(validationRequired = true)
 * public Object save() { ... }
 * }</pre>
 *
 * <p>Use {@link Toolbar} instead for a button in the page header. Not to be confused with the
 * fluent {@code io.mateu.uidl.data.Button} component.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Documented
public @interface Button {
  /** The emphasis: primary, secondary, tertiary… {@code none} keeps the renderer's default. */
  ButtonStyle buttonStyle() default ButtonStyle.none;

  /** The colour role (e.g. success, error, contrast). {@code none}: the default colour. */
  ButtonColor buttonColor() default ButtonColor.none;

  /** The size. {@code none}: the default size. */
  ButtonSize buttonSize() default ButtonSize.none;

  /**
   * Buttons sharing a non-blank group are collapsed into ONE dropdown button labelled with the
   * group name. Blank (the default): a button of its own.
   */
  String group() default "";

  /** Draws a separator before this button (or its group). */
  boolean separatorBefore() default false;

  /** Position among its siblings, ascending — reflection does not keep declaration order. */
  int order() default 0;
}
