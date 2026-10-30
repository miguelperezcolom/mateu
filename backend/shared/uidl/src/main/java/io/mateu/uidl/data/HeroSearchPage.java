package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.FormTemplate;

/**
 * Redwood's Hero search page template (Spectra {@code oj-sp-hero-search-page}): a search-first
 * landing page — a hero with the page's title and description over the search and its results. The
 * {@link io.mateu.uidl.fluent.Form} that carries it gives everything: its title and subtitle (the
 * description) head the hero, and its {@code content} is the results — a searchable listing. Its
 * own field is the hero's {@code backgroundColor}, as in {@link WelcomePage}.
 */
@Experimental("page templates (3.0 beta)")
public record HeroSearchPage(String backgroundColor) implements FormTemplate {

  /** The hero's tone (see {@link WelcomePage#toneOrNull()}). */
  public HeroTone toneOrNull() {
    return new WelcomePage(backgroundColor).toneOrNull();
  }
}
