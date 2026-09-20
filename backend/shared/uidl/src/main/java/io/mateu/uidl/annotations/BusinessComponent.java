package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares one named entry of the app's business-component catalogue (coherence-plan #13): a
 * reusable BOUND composition of existing components, stated ONCE and referenced by {@link #value()}
 * from any surface (see {@code @Component(ref = …)}). Put it on a FIELD (or a no-arg METHOD) that
 * holds/returns the composition — a fluent {@code Component} tree, typically a select bound to a
 * source. Every registered routed class is scanned and the entries collected into one catalogue; an
 * authored {@code components.yaml} is merged on top and wins.
 *
 * <p>The exact twin of {@code @RestSource}, one level up: a source names an ENDPOINT, this names a
 * COMPOSITION (which may itself reference a source). It introduces no new rendering, so it ports
 * for free and runs with no backend.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface BusinessComponent {

  /** The catalogue name this composition is referenced by; unique within the app. */
  String value();
}
