package io.mateu.explorer.examples.components.foldout;

import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.data.Ledger;
import io.mateu.uidl.data.LedgerLine;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A FoldoutLayout in Java: the overview plus one open and one folded panel. */
public class FluentFoldout implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return FoldoutLayout.builder()
        .headerTitle("Booking HB-20431")
        .style("height: 20rem;")
        .overview(new Text("Lucía Fernández · 14 → 17 Nov 2026 · Room 102"))
        .panels(
            List.of(
                FoldoutPanel.builder()
                    .id("folio")
                    .title("Folio")
                    .open(true)
                    .width("22rem")
                    .content(
                        Ledger.builder()
                            .currency("€")
                            .totalLabel("Balance")
                            .lines(List.of(new LedgerLine("Room, 3 nights", 1140.0, false, null), new LedgerLine("Deposit", -250.0, false, null)))
                            .build())
                    .build(),
                FoldoutPanel.builder()
                    .id("preferences")
                    .title("Preferences")
                    .open(false)
                    .summary(new Text("3 notes"))
                    .content(BulletedList.builder().items(List.of("High floor", "Feather-free pillows", "Late check-out")).build())
                    .build()))
        .build();
  }
}
