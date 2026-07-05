package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Lets Mateu infer the UX patterns of a form from the amount and structure of the declared
 * information, so the developer only declares the data and Mateu decides how to present it.
 *
 * <p>Inference only fills the gaps the developer left open — every explicit layout annotation
 * ({@link Section}, {@link Tab}, {@link Zones}, {@link FoldedLayout}, {@link Toc}, {@link
 * Stereotype}, {@link UseRadioButtons}…) always wins. The rules are deterministic and based on the
 * declared structure (number of sections, estimated visual weight of the fields, required vs
 * optional), never on runtime data, so the same class always renders the same way.
 *
 * <p>Current rules:
 *
 * <ul>
 *   <li><b>Fold optional fields</b> — on an editable form with no declared sections or tabs whose
 *       estimated weight exceeds one screen, required fields stay visible and optional fields are
 *       grouped into a collapsed "More options" panel.
 *   <li><b>Sections to tabs</b> — on a read-only view with many substantial sections (and no sticky
 *       section or explicit {@code @Toc}), sections are presented as tabs instead of a long
 *       vertical stack. The emitted tab layout is marked {@code adaptable}, so renderers may
 *       degrade it to an accordion on narrow viewports.
 *   <li><b>Small enums as radio buttons</b> — an enum field with few constants renders as radio
 *       buttons instead of a dropdown.
 * </ul>
 *
 * <p>{@code @AutoLayout(false)} opts a class out when inference is enabled globally via the {@code
 * mateu.layout.inference} system property.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface AutoLayout {
  boolean value() default true;
}
