package io.mateu.mdd.demovbpms.infra.in.ui.financials;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.mdd.demovbpms.domain.SimplePdf;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.UICommand;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Billing (OPERA Cloud 26.3 user guide, 006 "About Billing" and "Generating a Folio"): the folio
 * of an in-house reservation, generated as a PDF and downloaded.
 */
@UI("/billing")
@Title("Billing")
@ReadOnly
public class Billing {

  String reservation;
  String guest;
  String room;
  BigDecimal balance;

  Anchor guide =
      new Anchor(
          "OPERA Cloud user guide — Generating a Folio",
          "https://docs.oracle.com/en/industries/hospitality/opera-cloud/",
          "_blank",
          null,
          null);

  public Billing() {
    Hotel.Reservation r =
        Hotel.RESERVATIONS.stream()
            .filter(x -> x.status == Hotel.ReservationStatus.IN_HOUSE)
            .findFirst()
            .orElseThrow();
    reservation = r.confirmation;
    guest = r.guest;
    room = r.room;
    balance =
        Hotel.chargesOf(r.id).stream()
            .map(c -> c.amount().add(c.tax()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  @Toolbar
  @Label("Generate folio (PDF)")
  public UICommand generateFolio() {
    Hotel.Reservation r =
        Hotel.RESERVATIONS.stream()
            .filter(x -> x.confirmation.equals(reservation))
            .findFirst()
            .orElseThrow();
    List<String> lines = new ArrayList<>();
    lines.add(Hotel.PROPERTY + " - Guest folio");
    lines.add("Guest: " + r.guest + "   Room: " + r.room + "   Confirmation: " + r.confirmation);
    lines.add("Arrival: " + r.arrival + "   Departure: " + r.departure);
    lines.add("");
    for (Hotel.Charge c : Hotel.chargesOf(r.id))
      lines.add(c.date() + "   " + c.code() + "   " + c.description() + "   " + c.amount() + " EUR");
    lines.add("");
    lines.add("Balance: " + balance + " EUR");
    return UICommand.downloadFile(
        "folio-" + r.confirmation + ".pdf", "application/pdf", SimplePdf.of("Folio", lines));
  }
}
