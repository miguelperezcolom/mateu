package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.FieldStereotype;

/**
 * Decides at runtime the rendering {@link FieldStereotype} of a form member. Implement {@link
 * #stereotype(String, HttpRequest)} to choose how the field {@code memberName} is presented (e.g.
 * badge, money, grid) dynamically, instead of via a static {@code @Stereotype} annotation.
 */
public interface StereotypeSupplier {

  FieldStereotype stereotype(String memberName, HttpRequest httpRequest);
}
