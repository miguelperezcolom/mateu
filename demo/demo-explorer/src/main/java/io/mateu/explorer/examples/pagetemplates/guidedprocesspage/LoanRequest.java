package io.mateu.explorer.examples.pagetemplates.guidedprocesspage;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.data.Message;

/**
 * The form behind the YAML guided-process page: every step edits these fields — all the steps are
 * ONE form, so moving between them keeps what was typed — and the primary button ({@code actionId:
 * send}) runs {@link #send}.
 */
public class LoanRequest {
  public String artwork;
  public String borrower;
  public String exhibition;
  public java.time.LocalDate leaves;
  public java.time.LocalDate returns;
  public Double insuranceValue;
  public String courier;

  @Action(validationRequired = true)
  public Message send() {
    return Message.success("Loan of “" + artwork + "” to " + borrower + " requested");
  }
}
