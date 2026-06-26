package io.mateu.uidl.annotations;

import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
// ANNOTATION_TYPE so it can be used as a meta-annotation on a semantic annotation
// (e.g. @ProveedorId), resolved via MetaAnnotations.
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Lookup {

  Class<? extends LookupOptionsSupplier> search() default LookupOptionsSupplier.class;

  Class<? extends LookupLabelSupplier> label() default LookupLabelSupplier.class;

  boolean bubble() default false;
}
