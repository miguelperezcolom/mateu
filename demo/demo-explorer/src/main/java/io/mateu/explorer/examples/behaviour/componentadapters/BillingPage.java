package io.mateu.explorer.examples.behaviour.componentadapters;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.PlainText;

/**
 * An ordinary form with a field of the adapted type: the {@code invoice} renders through {@link
 * InvoiceAdapter} as an independent island — its button round-trips through the adapter on its
 * own.
 */
@Title("Billing")
public class BillingPage {

  @PlainText String account = "ACC-7781 · Bodegas Riojanas";

  Invoice invoice = new Invoice();
}
