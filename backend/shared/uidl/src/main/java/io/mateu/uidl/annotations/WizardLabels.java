package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The labels of a {@code Wizard}'s built-in navigation buttons. By default they are "Back" and
 * "Next" passed through the app's {@code Translator} (so a {@code messages_<lang>.properties} with
 * {@code Back=Atrás} / {@code Next=Siguiente} localizes them per the request's locale, like any
 * other Mateu text). An app whose screens are written in one language can set them here instead;
 * the values go through the translator too. For labels decided per request, override {@code
 * Wizard.backLabel} / {@code Wizard.nextLabel}.
 *
 * <pre>{@code
 * @WizardLabels(back = "Atrás", next = "Siguiente")
 * public class CheckInWizard extends Wizard { … }
 * }</pre>
 *
 * <p>The completion button's label is the {@code @Label} of the {@code @WizardCompletionAction}
 * method.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface WizardLabels {

  /** The "Back" button's label; empty = "Back", translated. */
  String back() default "";

  /** The "Next" button's label; empty = "Next", translated. */
  String next() default "";
}
