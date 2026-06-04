package io.mateu.uidl.annotations;

import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.Selector;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Searchable {

  Class<? extends Selector> selector() default Selector.class;

  Class<? extends LabelSupplier> label() default LabelSupplier.class;

  boolean bubble() default false;

  boolean editableCode() default false;

  boolean showCode() default false;
}
