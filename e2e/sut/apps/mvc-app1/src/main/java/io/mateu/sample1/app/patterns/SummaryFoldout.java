package io.mateu.sample1.app.patterns;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;

/** Pattern gaps showcase: what a FOLDED foldout panel shows in its strip (the summary slot). */
@UI("/patterns/foldout")
@Title("Booking 4711")
public class SummaryFoldout extends Foldout {

  Component overview = new Text("overview", "Ada Lovelace · 3 nights · Ocean view");

  @Panel(title = "Payments", open = false)
  Component payments = new Text("payments", "Deposit €120 paid, balance €240 due at check-in.");

  @Panel(title = "Requests", open = false)
  Component requests = new Text("requests", "Late check-out; feather-free pillows.");

  @Panel(title = "History", open = true)
  Component history = new Text("history", "Booked on 2 Oct; modified on 5 Oct.");

  @Override
  protected Component panelSummary(String panelFieldName) {
    return switch (panelFieldName) {
      case "payments" -> new Text("payments-summary", "€240 due");
      case "requests" -> new Text("requests-summary", "2 open");
      default -> null;
    };
  }
}
