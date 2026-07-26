package io.mateu.uidl.annotations;

import io.mateu.uidl.data.ContentAsidePosition;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a component-holder field (a {@code Component}, or a {@code Callable}/{@code Supplier} of
 * one) as the contextual <b>aside</b> of the page: it is pulled out of the form body and placed
 * beside the rest of the form in a {@link io.mateu.uidl.data.ContentLayout} — the form becomes the
 * {@code main} region, the {@code @Aside} field(s) the {@code aside} region. This is the minimal
 * way to compose the Redwood content-page grammar from a plain form: you declare data as usual and
 * mark the one supporting panel that should sit to the side.
 *
 * <p>The aside sits on the {@link #position()} side, sized to {@link #width()}, optionally {@link
 * #sticky()}; it stacks under the form on narrow viewports. Several {@code @Aside} fields stack in
 * the aside in declaration order.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Aside {

  /** Which side the aside sits on (default {@code end}). */
  ContentAsidePosition position() default ContentAsidePosition.end;

  /**
   * CSS width of the aside column (e.g. {@code "22rem"} / {@code "32%"}); blank = renderer default.
   */
  String width() default "";

  /** Whether the aside is pinned while the main region scrolls. */
  boolean sticky() default true;
}
