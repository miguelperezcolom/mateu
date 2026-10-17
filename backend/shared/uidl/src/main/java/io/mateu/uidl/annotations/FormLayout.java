package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Documented
public @interface FormLayout {

  String theme() default "";

  String style() default "";

  int columns() default 2;

  /**
   * Where the field labels sit. Default {@link LabelsAsideMode#AUTO}: Mateu infers it from the
   * form's shape (labels-aside only for dense single-column forms of short-labelled, single-line
   * widgets).
   */
  LabelsAsideMode labelsAside() default LabelsAsideMode.AUTO;
}
