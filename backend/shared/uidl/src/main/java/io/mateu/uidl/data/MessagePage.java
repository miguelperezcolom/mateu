package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * A message page: one card, centred near the top of a full-bleed illustrated background, with no
 * app chrome around it — for a confirmation, a "check your email", an error, a signed-out page or a
 * simple entry page (a sign-in form). Spectra ships no component for it, so every renderer composes
 * it. The card is filled from the {@link io.mateu.uidl.fluent.Form} that carries it — its title is
 * the card's heading, its subtitle and overline the lines around it, its {@code content} the card's
 * body (text, links, fields, buttons) and its toolbar the card's actions — and the template's own
 * {@code footer} slot is the row of small links at the card's foot. Its fields: the {@code
 * background}, a tone of the welcome palette ({@code ocean}…{@code sienna}, Spectra's {@code
 * dark-<tone>} accepted) that tints the illustration ({@code auto} or none keeps the default); an
 * own {@code image} (a URL) that replaces the illustration; and the card's {@code width} (a CSS
 * length, 460px when absent).
 */
@Experimental("page templates (3.0 GA)")
@Builder
public record MessagePage(
    String background, String image, String width, @Singular("footerItem") List<Component> footer)
    implements FormTemplate {

  public MessagePage {
    footer = footer != null ? footer : Collections.emptyList();
  }

  /** The background's tone (see {@link WelcomePage#toneOrNull()}). */
  public HeroTone toneOrNull() {
    return new WelcomePage(background).toneOrNull();
  }

  /**
   * The own image's URL when it is safe to put in a CSS {@code url("…")} (no quote, parenthesis or
   * backslash could end it), else {@code null}.
   */
  public String imageOrNull() {
    if (image == null || image.isBlank()) return null;
    String trimmed = image.trim();
    return trimmed.matches("[\\w\\s/.:%~?&=#+,@-]+") ? trimmed : null;
  }

  /** The card's width when it is a plain CSS length ({@code 32rem}, {@code 520px}…), else null. */
  public String widthOrNull() {
    if (width == null || width.isBlank()) return null;
    String trimmed = width.trim();
    return trimmed.matches("\\d+(\\.\\d+)?(px|rem|em|ch|vw|%)") ? trimmed : null;
  }
}
