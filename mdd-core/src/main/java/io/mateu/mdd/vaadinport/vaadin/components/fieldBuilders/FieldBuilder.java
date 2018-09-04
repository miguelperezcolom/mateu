package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD}) //can use in method only.
public @interface FieldBuilder {

    Class<? extends AbstractFieldBuilder> value();
}