package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Drops the chrome (title and outlined card) the framework would otherwise add around a nested
 * field, so it blends into its host section/tab.
 *
 * <ul>
 *   <li>On a field of <strong>POJO</strong> type: expands that type's fields inline into the parent
 *       section. The parent field's {@link Section} annotation provides the section header; no Card
 *       wrapper is added around the expanded content. Annotate the POJO type with {@link PlainText}
 *       and/or {@link Compact} as needed — those class-level annotations are not inherited from the
 *       enclosing form.
 *   <li>On a field of <strong>embedded orchestrator</strong> type (a {@code MultiView} subclass
 *       such as {@code AutoEditableView}): the inner view drops badges/kpis, demotes its title from
 *       {@code h2} to {@code h3} so it nests under the host, and (for single-section forms) drops
 *       the outlined Card wrapper around its content. The parent {@link Section} that hosts it also
 *       drops its own title row so the embedded {@code h3} title + toolbar render as one coherent
 *       row inside the section's card. For tabs (which have no parent title row), the embedded
 *       {@code h3} becomes the only visible title — remove {@link Title} from the inner model to
 *       suppress it entirely.
 * </ul>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Inline {}
