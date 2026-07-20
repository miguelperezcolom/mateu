package io.mateu.uidl.annotations;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
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
