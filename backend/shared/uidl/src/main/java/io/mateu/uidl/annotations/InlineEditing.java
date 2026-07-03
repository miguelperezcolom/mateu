package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Enables <b>inline editing</b> on a list/collection grid field: the row cells become editable
 * inputs right in the grid, instead of opening a separate detail form. Edits travel back in the
 * normal component state, so they are persisted when the enclosing form's action runs.
 *
 * <pre>{@code
 * @InlineEditing
 * @Stereotype(FieldStereotype.grid)
 * List<OrderLine> lines;
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface InlineEditing {}
