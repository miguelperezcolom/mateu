package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.FormTemplate;

/**
 * Redwood's Welcome page template (Spectra {@code oj-sp-welcome-page}): a welcome banner over the
 * page's tiles. The banner is filled from the {@link io.mateu.uidl.fluent.Form} that carries it —
 * its title is the page title, its subtitle the description, its overline the line above the title,
 * its toolbar the banner's calls to action (a {@code primary} one first) — and the form's {@code
 * content} is the template's default slot, the tiles below the banner. Its own field is the
 * banner's {@code backgroundColor}, Spectra's value ({@code dark-slate}…) or the bare tone ({@code
 * slate}…); {@code auto} or none keeps the default look.
 */
@Experimental("page templates (3.0 beta)")
public record WelcomePage(String backgroundColor) implements FormTemplate {

  /** The banner's tone: Spectra's {@code dark-<tone>} or the bare tone; {@code null} if unknown. */
  public HeroTone toneOrNull() {
    if (backgroundColor == null || backgroundColor.isBlank()) return null;
    String tone = backgroundColor.trim().replaceFirst("^dark-", "");
    for (HeroTone t : HeroTone.values()) {
      if (t.name().equalsIgnoreCase(tone)) return t == HeroTone.auto ? null : t;
    }
    return null;
  }
}
