package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.FormTemplate;

/**
 * Redwood's Multimedia content page template (Spectra {@code oj-sp-multimedia-content-page}): a
 * welcome-style banner over content in sections with media, and a vertical anchor navigator to move
 * between the sections. The banner is filled from the {@link io.mateu.uidl.fluent.Form} that
 * carries it — its title, subtitle (the description), overline and toolbar (the calls to action) —
 * and the form's {@code content} is the sections. Its own field is the banner's {@code
 * backgroundColor}, as in {@link WelcomePage}.
 */
@Experimental("page templates (3.0 beta)")
public record MultimediaContentPage(String backgroundColor) implements FormTemplate {

  /** The banner's tone (see {@link WelcomePage#toneOrNull()}). */
  public HeroTone toneOrNull() {
    return new WelcomePage(backgroundColor).toneOrNull();
  }
}
