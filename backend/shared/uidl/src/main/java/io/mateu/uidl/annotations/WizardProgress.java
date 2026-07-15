package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Chooses how a {@code Wizard} subclass visualizes its progress — a progress bar (default) or
 * connected step bullets. See {@link WizardProgressStyle}.
 *
 * <pre>{@code
 * @UI("/registration")
 * @WizardProgress(WizardProgressStyle.STEPS)
 * public class RegistrationWizard extends Wizard { … }
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface WizardProgress {
  WizardProgressStyle value() default WizardProgressStyle.BAR;
}
