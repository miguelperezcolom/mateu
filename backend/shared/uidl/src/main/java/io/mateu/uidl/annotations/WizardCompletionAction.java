package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface WizardCompletionAction {

  /**
   * The step (its field name) from which this completion action is already offered — beside "Next"
   * — so a user with nothing more to add can finish early (the Redwood guided-process {@code
   * availableFromStep}). Empty (the default) = only on the last step before the result.
   */
  @Experimental("early wizard completion (3.0-alpha.409)")
  String availableFromStep() default "";
}
