package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Ledger;
import io.mateu.uidl.data.LedgerLine;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Ledger} component: a guest folio breakdown with total. */
@UI("/ledger-demo")
@Title("Folio")
public class FolioLedger {

  @Section("Desglose del folio")
  Component folio =
      Ledger.builder()
          .currency("€")
          .totalLabel("Total")
          .lines(
              List.of(
                  LedgerLine.builder().concept("Alojamiento x7 noches").amount(1540.0).build(),
                  LedgerLine.builder()
                      .concept("All Inclusive Package")
                      .included(true)
                      .includedLabel("Incluido")
                      .build(),
                  LedgerLine.builder().concept("Circuito Spa x2").amount(78.0).build(),
                  LedgerLine.builder().concept("Late check-out").amount(40.0).build(),
                  LedgerLine.builder().concept("Minibar").amount(206.5).build(),
                  LedgerLine.builder()
                      .concept("Descuento Platinum -10%")
                      .amount(-154.0)
                      .build()))
          .total(1710.5)
          .build();
}
