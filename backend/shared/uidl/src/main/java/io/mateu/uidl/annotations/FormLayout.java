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

  /**
   * Column count of the form. {@code 0} (the default) means unset: Mateu decides from the size of
   * the form — ONE column when it has up to 6 visible fields, TWO from 7 on (see the forms guide).
   * Any explicit value ≥ 1 wins; {@code @FormLayout(columns = 2)} keeps the two-column look of a
   * small form.
   */
  int columns() default 0;

  /**
   * Where the field labels sit. Default {@link LabelsAsideMode#AUTO}: Mateu infers it from the
   * form's shape (labels-aside only for dense single-column forms of short-labelled, single-line
   * widgets).
   */
  LabelsAsideMode labelsAside() default LabelsAsideMode.AUTO;
}
