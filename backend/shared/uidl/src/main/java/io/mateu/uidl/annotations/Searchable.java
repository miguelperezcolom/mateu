package io.mateu.uidl.annotations;

import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.Selector;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
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
