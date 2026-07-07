package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders the field's dropdown as a TREE instead of a flat option list. The hierarchy comes from
 * the field's options carrying {@code children} — typically supplied by the view class implementing
 * {@code OptionsSupplier} and returning nested {@code Option}s. Selecting a node stores its value
 * in the field, exactly like a plain select.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface TreeSelect {

  /** When true only LEAF nodes are selectable; intermediate nodes just expand/collapse. */
  boolean leavesOnly() default false;
}
