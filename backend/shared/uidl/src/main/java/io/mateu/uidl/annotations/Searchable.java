package io.mateu.uidl.annotations;

import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.Selector;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * A field whose value is picked in a modal: a «Search» button opens the {@link #selector()} —
 * typically a {@code Listing} that implements {@link Selector} — and the picked row's id is set on
 * the field, displayed through {@link #label()}.
 *
 * <p>On a MULTI-valued field — a {@code List}, {@code Set} or array of ids — the ids show as
 * removable chips and the modal opens with row selection and «Add selected»: the picked rows are
 * added to the field (in order, without duplicates). The selector maps the checked rows with {@link
 * Selector#selectedItems}, which by default reuses {@link Selector#selected}.
 */
@Retention(RetentionPolicy.RUNTIME)
// ANNOTATION_TYPE so it can be used as a meta-annotation on a semantic annotation,
// resolved via MetaAnnotations.
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Searchable {

  Class<? extends Selector> selector() default Selector.class;

  Class<? extends LookupLabelSupplier> label() default LookupLabelSupplier.class;

  boolean bubble() default false;

  boolean editableCode() default false;

  boolean showCode() default false;
}
