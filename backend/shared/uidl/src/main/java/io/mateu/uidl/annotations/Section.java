package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface Section {

  String value();

  /**
   * Column count of this section's form layout. {@code 0} (the default) means unset: the section
   * inherits the form-level count ({@code @FormLayout(columns=…)} on the class, else 2). Any
   * explicit value ≥ 1 wins — including {@code 1} to force single-column stacking on a form whose
   * other sections stay multi-column.
   */
  int columns() default 0;

  String style() default "";

  /**
   * Name of the layout zone this section belongs to. When the form class is annotated with {@link
   * Zones}, sections sharing a zone are stacked together inside that zone's column, and the
   * declared zones are laid out side by side. Empty means no zone (classic full-width vertical
   * stacking).
   */
  String zone() default "";

  /**
   * When {@code true} the section card is pinned ({@code position: sticky}) so it stays in view
   * while the rest of the form scrolls. Useful for a reference/list section that should never leave
   * the viewport (e.g. a guests list on a long check-in screen).
   */
  boolean sticky() default false;

  /**
   * When {@code true} the section renders as a <b>property list</b>: every data field becomes a
   * read-only row (plain-text value, like {@code @PlainText}) with the label aligned left and the
   * value aligned right, rows separated by a divider line and stacked in a single column —
   * regardless of {@code columns}. Component-holding fields in the section are left untouched. Use
   * it for key-info panels (document data, booking summary) without annotating every field.
   */
  boolean propertyList() default false;

  /**
   * When {@code true} the section is not framed: no outlined card wrapper (border/background) and
   * no card padding — the section content sits bare on the page. Use it for bands whose content
   * already brings its own chrome (a header card, a progress banner) so it doesn't get
   * double-framed. Note frameless sections are not enumerated by the {@code @Toc} sections index
   * (the index anchors on section cards).
   */
  boolean frameless() default false;
}
