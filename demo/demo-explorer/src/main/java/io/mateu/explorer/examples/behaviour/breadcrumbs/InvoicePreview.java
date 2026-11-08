package io.mateu.explorer.examples.behaviour.breadcrumbs;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@code /x/behaviour/breadcrumbs/invoices/2026-42} (a route with a path parameter). */
public class InvoicePreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/breadcrumbs/invoices/2026-42";
  }
}
