package io.mateu.uidl.annotations;

import io.mateu.uidl.data.FieldStereotype;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Representation {

  FieldStereotype value();
}
