package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.PageSetup;

/**
 * Turns HTML into a printable document (a PDF) — the port behind invoices, registration cards and
 * reports. Engine-agnostic on the way in: render the HTML with whatever template engine the app
 * already uses (Thymeleaf, Freemarker, Mustache, a text block) and hand over the string.
 *
 * <p>{@code io.mateu:mateu-documents} provides an implementation (Apache PDFBox + jsoup, both
 * permissively licensed) for a documented HTML subset; register another bean to plug in a full-CSS
 * engine (a headless browser, a commercial or LGPL renderer) without touching the screens that use
 * it. Return the bytes from an action wrapped in {@link io.mateu.uidl.data.Document}.
 */
@Experimental("documents API, 2026-10")
public interface DocumentRenderer {

  /** The media type of what {@link #render} produces. */
  default String mediaType() {
    return "application/pdf";
  }

  /** Renders {@code html} laid out by {@code setup}. */
  byte[] render(String html, PageSetup setup);

  /** Renders {@code html} on A4 with page numbers. */
  default byte[] render(String html) {
    return render(html, PageSetup.a4());
  }
}
