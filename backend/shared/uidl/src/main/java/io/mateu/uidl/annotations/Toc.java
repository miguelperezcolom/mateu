package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Shows a sticky index (table of contents) of the page's sections in a right-hand sidebar. Each
 * entry lists a {@link Section} title and scrolls to that section when clicked; the active section
 * is highlighted as the user scrolls.
 *
 * <p>Tri-state: absent means <b>auto</b> — the frontend shows the index only when there are enough
 * sections stacked vertically (more than four) and the form is not laid out with {@link Zones} /
 * {@code @FoldedLayout}. {@code @Toc} (or {@code @Toc(true)}) forces the index on;
 * {@code @Toc(false)} suppresses it even when the auto heuristic would show it.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface Toc {
  boolean value() default true;
}
