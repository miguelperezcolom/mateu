package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({
  ElementType.FIELD,
  ElementType.METHOD,
  ElementType.TYPE,
  ElementType.ANNOTATION_TYPE
}) // can use in method only.
@Documented
public @interface EyesOnly {

  String[] roles() default {};

  String[] groups() default {};

  String[] scopes() default {};

  String[] permissions() default {};
}
