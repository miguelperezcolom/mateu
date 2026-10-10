package io.mateu.mdd.demovbpms.infra.in.ui.home;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartOptions;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import java.net.URI;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Manager dashboard (OPERA Cloud 26.3 user guide, 001 "Dashboards": tiles with the day's figures
 * that drill into the matching search, plus charts). Each KPI tile runs an action that opens the
 * reservation search already filtered by the tile's status.
 */
@UI("/dashboard")
@Title("Dashboard")
public class PmsDashboard extends Dashboard {

  MetricCard arrivals = metric("arrivals", "Arrivals today", count(Hotel.ReservationStatus.DUE_IN), "openArrivals");
  MetricCard inHouse = metric("inHouse", "In house", count(Hotel.ReservationStatus.IN_HOUSE), "openInHouse");
  MetricCard departures = metric("departures", "Departures today", count(Hotel.ReservationStatus.DUE_OUT), "openDepartures");
  MetricCard occupancy =
      MetricCard.builder()
          .id("occupancy")
          .title("Occupancy tonight")
          .value(String.valueOf(occupancyPct(Hotel.businessDate())))
          .unit("%")
          .trend(MetricTrend.up)
          .trendLabel("vs last week")
          .description(Hotel.PROPERTY)
          .build();

  @Panel(title = "Occupancy — next 14 days", subtitle = "Occupancy % and rooms sold", colSpan = 2)
  Chart forecast = occupancyForecast();

  @Panel(title = "Reservations by status")
  Chart statuses = reservationsByStatus();

  @Panel(title = "Revenue by room type", subtitle = "Room and extras, € (in house)", colSpan = 2)
  Chart revenue = revenueByType();

  @Panel(title = "Room status")
  Chart rooms = roomStatus();

  @Override
  protected int columns() {
    return 3;
  }

  @Action
  public URI openArrivals() {
    return URI.create("/bookings/reservations?status=DUE_IN");
  }

  @Action
  public URI openInHouse() {
    return URI.create("/bookings/reservations?status=IN_HOUSE");
  }

  @Action
  public URI openDepartures() {
    return URI.create("/bookings/reservations?status=DUE_OUT");
  }

  private static MetricCard metric(String id, String title, long value, String actionId) {
    return MetricCard.builder()
        .id(id)
        .title(title)
        .value(String.valueOf(value))
        .description("Open the list")
        .actionId(actionId)
        .build();
  }

  private static long count(Hotel.ReservationStatus status) {
    return Hotel.RESERVATIONS.stream().filter(r -> r.status == status).count();
  }

  private static long sold(LocalDate d) {
    return Hotel.RESERVATIONS.stream()
        .filter(r -> r.status != Hotel.ReservationStatus.CANCELLED)
        .filter(r -> !r.arrival.isAfter(d) && r.departure.isAfter(d))
        .count();
  }

  private static long occupancyPct(LocalDate d) {
    return Math.round(100.0 * sold(d) / Hotel.ROOMS.size());
  }

  private static Chart occupancyForecast() {
    List<String> labels = new ArrayList<>();
    List<Double> pct = new ArrayList<>();
    List<Double> sold = new ArrayList<>();
    for (int i = 0; i < 14; i++) {
      LocalDate d = Hotel.businessDate().plusDays(i);
      labels.add(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getDayOfMonth());
      pct.add((double) occupancyPct(d));
      sold.add((double) sold(d));
    }
    return chart(
        ChartType.line,
        labels,
        List.of(new ChartDataset("Occupancy %", pct), new ChartDataset("Rooms sold", sold)));
  }

  private static Chart reservationsByStatus() {
    var statuses = Arrays.stream(Hotel.ReservationStatus.values()).toList();
    return chart(
        ChartType.doughnut,
        statuses.stream().map(s -> s.name().replace('_', ' ').toLowerCase()).toList(),
        List.of(
            new ChartDataset(
                "Reservations", statuses.stream().map(s -> (double) count(s)).toList())));
  }

  private static Chart revenueByType() {
    var types = Hotel.ROOMS.stream().map(Hotel.Room::type).distinct().toList();
    List<Double> room = new ArrayList<>();
    List<Double> extras = new ArrayList<>();
    for (String type : types) {
      var inHouse =
          Hotel.RESERVATIONS.stream()
              .filter(r -> r.status == Hotel.ReservationStatus.IN_HOUSE && type.equals(r.roomType))
              .toList();
      room.add(inHouse.stream().mapToDouble(r -> r.rate.doubleValue() * r.nights()).sum());
      extras.add(
          inHouse.stream()
              .flatMap(r -> Hotel.chargesOf(r.id).stream())
              .filter(c -> !c.code().startsWith("1"))
              .mapToDouble(c -> c.amount().doubleValue())
              .sum());
    }
    return chart(
        ChartType.bar,
        types,
        List.of(new ChartDataset("Room", room), new ChartDataset("Extras", extras)));
  }

  private static Chart roomStatus() {
    var statuses = Arrays.stream(Hotel.HousekeepingStatus.values()).toList();
    return chart(
        ChartType.pie,
        statuses.stream().map(s -> s.label).toList(),
        List.of(
            new ChartDataset(
                "Rooms",
                statuses.stream()
                    .map(s -> (double) Hotel.ROOMS.stream().filter(r -> r.status() == s).count())
                    .toList())));
  }

  private static Chart chart(ChartType type, List<String> labels, List<ChartDataset> datasets) {
    return new Chart(type, new ChartData(labels, datasets), ChartOptions.builder().build(), "", "");
  }
}
