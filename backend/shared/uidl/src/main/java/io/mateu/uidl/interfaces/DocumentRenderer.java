package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.PageSetup;

/**
 * Turns HTML into a printable document (a PDF) — a port for invoices, registration cards and
 * reports. <b>Mateu ships no implementation</b>: your application implements it with the library of
 * its choice (PDFBox, OpenPDF, openhtmltopdf, JasperReports, a headless browser…) and registers it
 * as a bean, so screens depend on the port and not on the library. Engine-agnostic on the way in:
 * render the HTML with whatever template engine the app already uses and hand over the string.
 * Return the bytes from an action wrapped in a {@link io.mateu.uidl.data.Document}. Building the
 * bytes directly in the action, without this interface, is just as valid.
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
