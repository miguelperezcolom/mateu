package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MatrixCell;
import io.mateu.uidl.data.MatrixColumn;
import io.mateu.uidl.data.MatrixGrid;
import io.mateu.uidl.data.MatrixRow;
import io.mateu.uidl.data.MatrixSection;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;

/**
 * Property Availability (OPERA Cloud 26.3 user guide, 003 "Property Availability": a grid of
 * dates with collapsible sections — house totals, availability by room type, controls — whose
 * availability cells open the day's detail and whose overbooking row is edited in place). A
 * {@link MatrixGrid}: rows × dates, weekends tinted, negative availability in red.
 */
@UI("/property-availability")
@Title("Property availability")
public class PropertyAvailability implements ComponentTreeSupplier {

  static final int DAYS = 14;

  /** Overbooking allowed per room type and date (in memory, like the rest of the demo). */
  static final Map<String, Integer> OVERBOOKING = new ConcurrentHashMap<>();

  @Override
  public Component component(HttpRequest httpRequest) {
    LocalDate from = Hotel.businessDate();
    List<LocalDate> dates = new ArrayList<>();
    for (int i = 0; i < DAYS; i++) dates.add(from.plusDays(i));
    var columns =
        dates.stream()
            .map(
                d ->
                    new MatrixColumn(
                        d.toString(),
                        d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                            + " "
                            + d.getDayOfMonth(),
                        d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                            + " "
                            + d.getYear(),
                        weekend(d) ? "neutral" : null))
            .toList();
    var types = Hotel.ROOMS.stream().map(Hotel.Room::type).distinct().toList();

    var total = row("total", "Total rooms", dates, d -> String.valueOf(rooms(t -> true)));
    var ooo = row("ooo", "Out of order", dates, d -> String.valueOf(outOfOrder()));
    var sold = row("sold", "Sold", dates, d -> String.valueOf(sold(d, t -> true)));
    var available =
        MatrixRow.builder()
            .id("available")
            .label("Available")
            .emphasis(true)
            .cells(dates.stream().map(d -> availability(d, t -> true, true)).toList())
            .build();
    var occupancy =
        row(
            "occupancy",
            "Occupancy %",
            dates,
            d -> Math.round(100.0 * sold(d, t -> true) / rooms(t -> true)) + "%");

    var byType =
        types.stream()
            .map(
                type ->
                    MatrixRow.builder()
                        .id(type)
                        .label(type)
                        .cells(
                            dates.stream()
                                .map(d -> availability(d, type::equals, true))
                                .toList())
                        .build())
            .toList();

    var controls =
        types.stream()
            .map(
                type ->
                    MatrixRow.builder()
                        .id("ob:" + type)
                        .label("Overbooking " + type)
                        .editable(true)
                        .cells(
                            dates.stream()
                                .map(d -> MatrixCell.of(OVERBOOKING.getOrDefault(key(type, d), 0)))
                                .toList())
                        .build())
            .toList();

    return VerticalLayout.builder()
        .content(
            List.of(
                new Text(
                    "subtitle",
                    Hotel.PROPERTY
                        + " · "
                        + DAYS
                        + " days from the business date "
                        + from
                        + " · click an availability figure for the day's arrivals, edit an"
                        + " overbooking cell in place (F2 or Enter)"),
                MatrixGrid.builder()
                    .id("availability")
                    .rowHeaderLabel("")
                    .cellActionId("openDay")
                    .editActionId("setOverbooking")
                    .columns(columns)
                    .sections(
                        List.of(
                            MatrixSection.builder()
                                .id("house")
                                .title("House")
                                .rows(List.of(total, ooo, sold, available, occupancy))
                                .build(),
                            MatrixSection.builder()
                                .id("types")
                                .title("Availability by room type")
                                .rows(byType)
                                .build(),
                            MatrixSection.builder()
                                .id("controls")
                                .title("Controls")
                                .rows(controls)
                                .build()))
                    .build()))
        .build();
  }

  @Action
  public Object openDay(HttpRequest rq) {
    var p = rq.runActionRq().parameters();
    LocalDate date = LocalDate.parse(String.valueOf(p.get("_columnId")));
    String row = String.valueOf(p.get("_rowId"));
    Predicate<String> type = "available".equals(row) ? t -> true : row::equals;
    long arrivals =
        Hotel.RESERVATIONS.stream()
            .filter(r -> r.status != Hotel.ReservationStatus.CANCELLED)
            .filter(r -> r.arrival.equals(date))
            .filter(r -> type.test(r.roomType))
            .count();
    return new Message(
        date
            + " · "
            + ("available".equals(row) ? "house" : row)
            + ": "
            + p.get("_value")
            + " available, "
            + arrivals
            + " arrivals");
  }

  @Action
  public Object setOverbooking(HttpRequest rq) {
    var p = rq.runActionRq().parameters();
    String type = String.valueOf(p.get("_rowId")).replaceFirst("^ob:", "");
    LocalDate date = LocalDate.parse(String.valueOf(p.get("_columnId")));
    int value;
    try {
      value = Integer.parseInt(String.valueOf(p.get("_value")).trim());
    } catch (NumberFormatException e) {
      return new Message("Overbooking must be a whole number");
    }
    OVERBOOKING.put(key(type, date), Math.max(0, value));
    return this;
  }

  private static String key(String type, LocalDate d) {
    return type + "@" + d;
  }

  private static boolean weekend(LocalDate d) {
    return d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
  }

  private static long rooms(Predicate<String> type) {
    return Hotel.ROOMS.stream().filter(r -> type.test(r.type())).count();
  }

  private static long outOfOrder() {
    return Hotel.ROOMS.stream().filter(Hotel.Room::outOfOrder).count();
  }

  private static long sold(LocalDate d, Predicate<String> type) {
    return Hotel.RESERVATIONS.stream()
        .filter(r -> r.status != Hotel.ReservationStatus.CANCELLED)
        .filter(r -> type.test(r.roomType))
        .filter(r -> !r.arrival.isAfter(d) && r.departure.isAfter(d))
        .count();
  }

  private static MatrixCell availability(LocalDate d, Predicate<String> type, boolean link) {
    long overbooking =
        OVERBOOKING.entrySet().stream()
            .filter(e -> e.getKey().endsWith("@" + d))
            .filter(e -> type.test(e.getKey().substring(0, e.getKey().indexOf('@'))))
            .mapToLong(Map.Entry::getValue)
            .sum();
    long free =
        rooms(type)
            - Hotel.ROOMS.stream().filter(r -> r.outOfOrder() && type.test(r.type())).count()
            - sold(d, type)
            + overbooking;
    return new MatrixCell(String.valueOf(free), free < 0 ? "danger" : free <= 2 ? "warning" : null, link);
  }

  private static MatrixRow row(
      String id, String label, List<LocalDate> dates, java.util.function.Function<LocalDate, String> f) {
    return MatrixRow.builder()
        .id(id)
        .label(label)
        .cells(dates.stream().map(d -> MatrixCell.of(f.apply(d))).toList())
        .build();
  }
}
