package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Page-level sibling of {@link AutoLayout}: lets Mateu infer the page <b>archetype</b> from the
 * declared information, so a plain class whose structure already spells a template renders as that
 * template without extending the archetype base class.
 *
 * <p>Current rules (deterministic, structure-based, never runtime data):
 *
 * <ul>
 *   <li><b>Dashboard</b> — a class declaring {@code MetricCard} fields (plus optional
 *       {@code @Panel} component fields) composes the {@code Dashboard} archetype: consecutive
 *       metric cards group into a KPI scoreboard band and panel fields become titled tiles on the
 *       grid.
 * </ul>
 *
 * <p>Explicit always wins: archetype subclasses, listing backends and fluent component trees are
 * never rewritten, and extending the archetype remains the way to take fine control (columns,
 * overrides). {@code @AutoPage(false)} opts a class out when inference is enabled globally via the
 * {@code mateu.layout.inference} system property.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface AutoPage {
  boolean value() default true;
}
