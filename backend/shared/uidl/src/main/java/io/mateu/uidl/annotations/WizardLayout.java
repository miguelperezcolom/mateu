package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Chooses how a {@code Wizard} subclass is rendered — one step at a time (default), an accumulative
 * layout that recaps completed steps, or a collapsible accordion. See {@link WizardLayoutMode}.
 *
 * <pre>{@code
 * @UI("/registration")
 * @WizardLayout(WizardLayoutMode.ACCORDION)
 * public class RegistrationWizard extends Wizard { … }
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface WizardLayout {
  WizardLayoutMode value() default WizardLayoutMode.STEPS;
}
