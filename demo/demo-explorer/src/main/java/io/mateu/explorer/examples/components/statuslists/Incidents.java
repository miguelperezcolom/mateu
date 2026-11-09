package io.mateu.explorer.examples.components.statuslists;

import io.mateu.uidl.data.Ledger;
import io.mateu.uidl.data.LedgerLine;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.ProcessItem;
import io.mateu.uidl.data.ProcessMonitor;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import java.util.List;

/**
 * The same lists in Java with their actions wired: a row's button runs {@code assign} (with
 * {@code _item} = the row id), the failing process's "Retry" runs {@code retryExport}.
 */
public class Incidents implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                StatusList.builder()
                    .items(
                        List.of(
                            StatusItem.builder().id("305").icon("🔧").title("Room 305 — air conditioning")
                                .description("Reported 08:40").status("Open").statusColor("error")
                                .actionLabel("Assign").actionId("assign").build(),
                            StatusItem.builder().id("118").icon("💧").title("Room 118 — leaking tap")
                                .description("Plumber on the way").status("In progress").statusColor("warning").build()))
                    .build(),
                Ledger.builder()
                    .currency("€")
                    .totalLabel("Balance due")
                    .lines(
                        List.of(
                            LedgerLine.builder().concept("Room 102 — 3 nights").amount(1140.0).build(),
                            LedgerLine.builder().concept("Breakfast").included(true).includedLabel("Included").build(),
                            LedgerLine.builder().concept("Deposit").amount(-250.0).build()))
                    .build(),
                ProcessMonitor.builder()
                    .items(
                        List.of(
                            ProcessItem.builder().id("export").name("Invoice export").systems(List.of("PMS", "ERP"))
                                .ok(88).errors(4).status("error").actionLabel("Retry").actionId("retryExport").build()))
                    .build()))
        .build();
  }

  public Message assign(HttpRequest httpRequest) {
    return Message.success("Room " + httpRequest.runActionRq().parameters().get("_item") + " assigned to maintenance");
  }

  public Message retryExport() {
    return Message.success("Invoice export re-queued: 4 invoices");
  }
}
