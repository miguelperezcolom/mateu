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
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.data.Message;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Supplier;
import reactor.core.publisher.Flux;

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
  Flux<?> run() {
    if (!cashiers.closeAll) {
      return Flux.just(Message.error("End of day stops here: close the open cashiers first."));
    }
    // each procedure runs as the stream reaches it, so the progress dialog shows them one by one
    List<Supplier<String>> steps =
        List.of(
            this::resolveArrivals,
            this::resolveDepartures,
            () -> "✓ Cashiers: " + cashiers.open.size() + " closed",
            this::postRoomAndTax,
            this::setOccupiedRoomsDirty,
            () -> {
              Hotel.rollBusinessDate();
              return "✓ Business date rolled to " + Hotel.businessDate();
            },
            () -> "✓ Final reports: Manager report, Trial balance");
    var procedures = new ArrayList<String>();
    return LongTask.create("Running end of day")
        .withProgressBar()
        .done("End of day", "All procedures finished")
        .closeAfter(1)
        .run(
            progress ->
                Flux.range(0, steps.size())
                    .delayElements(Duration.ofMillis(400))
                    .map(
                        i -> {
                          var line = steps.get(i).get();
                          procedures.add(line);
                          if (i == steps.size() - 1) {
                            result = new ResultStep();
                            result.businessDate = Hotel.businessDate().toString();
                            result.procedures = procedures;
                          }
                          return progress.step(line, (i + 1) / (double) steps.size());
                        }));
  }

  private String resolveArrivals() {
    int resolved = 0;
    for (var r : Hotel.RESERVATIONS) {
      if (Hotel.statusFor(r) == Hotel.ReservationStatus.DUE_IN) {
        // OPERA keeps no-shows apart from cancellations; this demo has one terminal status for both
        r.status = Hotel.ReservationStatus.CANCELLED;
        resolved++;
      }
    }
    return "✓ Arrivals: "
        + resolved
        + (arrivals.resolution == ArrivalsResolution.MARK_AS_NO_SHOW
            ? " marked as no-show"
            : " cancelled");
  }

  private String resolveDepartures() {
    int resolved = 0;
    for (var r : Hotel.RESERVATIONS) {
      if (Hotel.statusFor(r) == Hotel.ReservationStatus.DUE_OUT) {
        if (departures.resolution == DeparturesResolution.EXTEND_ONE_NIGHT) {
          r.departure = r.departure.plusDays(1);
        } else {
          r.status = Hotel.ReservationStatus.CHECKED_OUT;
        }
        resolved++;
      }
    }
    return "✓ Departures: "
        + resolved
        + (departures.resolution == DeparturesResolution.EXTEND_ONE_NIGHT
            ? " extended one night"
            : " checked out");
  }

  private List<Hotel.Reservation> inHouse() {
    return Hotel.RESERVATIONS.stream()
        .filter(r -> Hotel.statusFor(r) == Hotel.ReservationStatus.IN_HOUSE)
        .toList();
  }

  private String postRoomAndTax() {
    var date = Hotel.businessDate();
    var inHouse = inHouse();
    var roomRevenue = BigDecimal.ZERO;
    for (var r : inHouse) {
      Hotel.CHARGES.add(
          Hotel.charge("EOD-" + date + "-" + r.id, r.id, 1, date, "1000", "Room charge", r.rate));
      roomRevenue = roomRevenue.add(r.rate);
    }
    return "✓ Room and tax posted: " + inHouse.size() + " rooms · " + roomRevenue + " €";
  }

  private String setOccupiedRoomsDirty() {
    var occupied = inHouse().stream().map(r -> r.room).filter(Objects::nonNull).toList();
    Hotel.setRoomStatus(occupied, Hotel.HousekeepingStatus.DI);
    return "✓ Housekeeping: " + occupied.size() + " occupied rooms set to dirty";
  }
}
