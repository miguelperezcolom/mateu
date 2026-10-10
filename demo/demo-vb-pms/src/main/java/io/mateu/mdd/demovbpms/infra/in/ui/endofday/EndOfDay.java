package io.mateu.mdd.demovbpms.infra.in.ui.endofday;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.BulletedList;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;
import io.mateu.uidl.data.Message;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * End of Day (OPERA Cloud 26.3 user guide, 006 "Running End of Day"): the night audit as a guided
 * process whose steps STOP the run until the user resolves them there and then — arrivals not
 * checked in, departures not checked out, open cashiers — with the progress on a rail. Running it
 * posts room and tax, runs the posting procedures and rolls the business date; the last step is the
 * status of each procedure.
 */
@UI("/end-of-day")
@Title("End of day")
@WizardProgress(WizardProgressStyle.RAIL)
public class EndOfDay extends Wizard {

  public enum ArrivalsResolution {
    @Label("Mark as no-show")
    MARK_AS_NO_SHOW,
    @Label("Cancel")
    CANCEL
  }

  public enum DeparturesResolution {
    @Label("Extend one night")
    EXTEND_ONE_NIGHT,
    @Label("Check out")
    CHECK_OUT
  }

  @Title("Arrivals not checked in")
  public static class ArrivalsStep implements WizardStep {

    @PlainText
    @Label("Business date")
    public String businessDate = Hotel.businessDate().toString();

    @BulletedList
    @Label("Still due in")
    public List<String> pending =
        Hotel.RESERVATIONS.stream()
            .filter(r -> Hotel.statusFor(r) == Hotel.ReservationStatus.DUE_IN)
            .map(r -> r.confirmation + " · " + r.guest + (r.room != null ? " · room " + r.room : ""))
            .toList();

    @Label("Resolve them as")
    public ArrivalsResolution resolution = ArrivalsResolution.MARK_AS_NO_SHOW;
  }

  @Title("Departures not checked out")
  public static class DeparturesStep implements WizardStep {

    @BulletedList
    @Label("Still due out")
    public List<String> pending =
        Hotel.RESERVATIONS.stream()
            .filter(r -> Hotel.statusFor(r) == Hotel.ReservationStatus.DUE_OUT)
            .map(r -> r.confirmation + " · " + r.guest + " · room " + r.room)
            .toList();

    @Label("Resolve them as")
    public DeparturesResolution resolution = DeparturesResolution.EXTEND_ONE_NIGHT;
  }

  @Title("Open cashiers")
  public static class CashiersStep implements WizardStep {

    @BulletedList
    @Label("Cashiers still open")
    public List<String> open = List.of("2 · Front desk night shift", "5 · Beach bar");

    @Label("Close every open cashier (blind drop)")
    public boolean closeAll;
  }

  @Title("End of day completed")
  public static class ResultStep implements WizardStep {

    @PlainText
    @Label("New business date")
    public String businessDate;

    @BulletedList
    @Label("Procedures")
    public List<String> procedures = new ArrayList<>();
  }

  public ArrivalsStep arrivals = new ArrivalsStep();
  public DeparturesStep departures = new DeparturesStep();
  public CashiersStep cashiers = new CashiersStep();
  public ResultStep result;

  @WizardCompletionAction
  @Label("Run end of day")
  Object run() {
    if (!cashiers.closeAll) {
      return Message.error("End of day stops here: close the open cashiers first.");
    }
    var procedures = new ArrayList<String>();
    var date = Hotel.businessDate();
    int arrivalsResolved = 0;
    int departuresResolved = 0;
    for (var r : Hotel.RESERVATIONS) {
      var status = Hotel.statusFor(r);
      if (status == Hotel.ReservationStatus.DUE_IN) {
        // OPERA keeps no-shows apart from cancellations; this demo has one terminal status for both
        r.status = Hotel.ReservationStatus.CANCELLED;
        arrivalsResolved++;
      } else if (status == Hotel.ReservationStatus.DUE_OUT) {
        if (departures.resolution == DeparturesResolution.EXTEND_ONE_NIGHT) {
          r.departure = r.departure.plusDays(1);
        } else {
          r.status = Hotel.ReservationStatus.CHECKED_OUT;
        }
        departuresResolved++;
      }
    }
    procedures.add(
        "✓ Arrivals: "
            + arrivalsResolved
            + (arrivals.resolution == ArrivalsResolution.MARK_AS_NO_SHOW
                ? " marked as no-show"
                : " cancelled"));
    procedures.add(
        "✓ Departures: "
            + departuresResolved
            + (departures.resolution == DeparturesResolution.EXTEND_ONE_NIGHT
                ? " extended one night"
                : " checked out"));
    procedures.add("✓ Cashiers: " + cashiers.open.size() + " closed");
    var inHouse =
        Hotel.RESERVATIONS.stream()
            .filter(r -> Hotel.statusFor(r) == Hotel.ReservationStatus.IN_HOUSE)
            .toList();
    var roomRevenue = BigDecimal.ZERO;
    for (var r : inHouse) {
      Hotel.CHARGES.add(Hotel.charge("EOD-" + date + "-" + r.id, r.id, 1, date, "1000", "Room charge", r.rate));
      roomRevenue = roomRevenue.add(r.rate);
    }
    procedures.add(
        "✓ Room and tax posted: " + inHouse.size() + " rooms · " + roomRevenue + " €");
    var occupied = inHouse.stream().map(r -> r.room).filter(java.util.Objects::nonNull).toList();
    Hotel.setRoomStatus(occupied, Hotel.HousekeepingStatus.DI);
    procedures.add("✓ Housekeeping: " + occupied.size() + " occupied rooms set to dirty");
    Hotel.rollBusinessDate();
    procedures.add("✓ Business date rolled to " + Hotel.businessDate());
    procedures.add("✓ Final reports: Manager report, Trial balance");
    result = new ResultStep();
    result.businessDate = Hotel.businessDate().toString();
    result.procedures = procedures;
    return null;
  }
}
