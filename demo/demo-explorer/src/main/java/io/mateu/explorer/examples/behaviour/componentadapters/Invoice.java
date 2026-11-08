package io.mateu.explorer.examples.behaviour.componentadapters;

import io.mateu.uidl.data.Message;

/**
 * A plain domain object: no Mateu annotation, not a Mateu component. Its whole UI — and turning the
 * state that comes back into an Invoice again — is {@link InvoiceAdapter}'s job. Its methods are
 * still the actions: {@code issue} runs on the Invoice the adapter rebuilt.
 */
public class Invoice {

  public String number = "INV-2026-0042";
  public String customer = "Bodegas Riojanas S.A.";
  public int lines = 12;
  public double total = 1450.75;

  public Invoice() {}

  Object issue() {
    return Message.success("Issued " + number + " to " + customer + " · " + lines + " lines · " + total);
  }
}
