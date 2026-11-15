package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.text.NumberFormat;
import java.util.Arrays;
import java.util.Currency;
import java.util.List;
import java.util.Locale;

/**
 * A {@link Dashboard}: consecutive {@link MetricCard} fields become the KPI band at the top, and
 * {@code @Panel} fields become titled tiles on a responsive grid below. Every number is computed
 * from the stores when the page is built (a view model is created fresh on every request), so the
 * KPIs follow what you change in the Products screen. A card's {@code actionId} makes it clickable:
 * it runs the {@code @Action} method of that name, which navigates by returning a URI.
 *
 * <p>A {@link MetricCard} shows its value as written, so the revenue is formatted for the person
 * looking at it — in the language their browser asks for — never in the server's default locale.
 */
@Title("Overview")
public class Overview extends Dashboard {

  MetricCard revenue = revenueCard(Locale.ENGLISH);

  MetricCard openOrders =
      MetricCard.builder()
          .title("Open orders")
          .value(String.valueOf(OrderStore.INSTANCE.count(OrderStatus.Open)))
          .timeframe("Right now")
          .trend(MetricTrend.neutral)
          .icon("vaadin:cart")
          .actionId("openOrders")
          .build();

  MetricCard availableProducts =
      MetricCard.builder()
          .title("Products available")
          .value(
              String.valueOf(
                  ProductStore.INSTANCE.findAll().stream()
                      .filter(p -> p.status() == ProductStatus.Available)
                      .count()))
          .timeframe("In the catalogue")
          .icon("vaadin:package")
          .actionId("openProducts")
          .build();

  @Panel(title = "Revenue per month", subtitle = "Paid and shipped orders", colSpan = 2)
  Chart revenuePerMonth =
      chart(ChartType.bar, OrderStore.lastSixMonths(), "Revenue", OrderStore.INSTANCE.revenuePerMonth());

  @Panel(title = "Orders by status")
  Chart ordersByStatus =
      chart(
          ChartType.pie,
          Arrays.stream(OrderStatus.values()).map(Enum::name).toList(),
          "Orders",
          Arrays.stream(OrderStatus.values())
              .map(s -> (double) OrderStore.INSTANCE.count(s))
              .toList());

  @Override
  public Component component(HttpRequest httpRequest) {
    revenue = revenueCard(viewerLocale(httpRequest));
    return super.component(httpRequest);
  }

  private static MetricCard revenueCard(Locale locale) {
    var euros = NumberFormat.getCurrencyInstance(locale);
    euros.setCurrency(Currency.getInstance("EUR"));
    return MetricCard.builder()
        .title("Revenue")
        .value(euros.format(OrderStore.INSTANCE.revenue()))
        .timeframe("Paid and shipped orders")
        .trend(MetricTrend.up)
        .icon("vaadin:dollar")
        .build();
  }

  /** The browser's first language (Accept-Language), else English. */
  private static Locale viewerLocale(HttpRequest httpRequest) {
    String accepted = httpRequest == null ? null : httpRequest.getHeaderValue("Accept-Language");
    if (accepted == null || accepted.isBlank()) return Locale.ENGLISH;
    try {
      var ranges = Locale.LanguageRange.parse(accepted);
      return ranges.isEmpty() ? Locale.ENGLISH : Locale.forLanguageTag(ranges.get(0).getRange());
    } catch (IllegalArgumentException e) {
      return Locale.ENGLISH;
    }
  }

  @Action
  URI openOrders() {
    return URI.create("/orders");
  }

  @Action
  URI openProducts() {
    return URI.create("/products");
  }

  private static Chart chart(
      ChartType type, List<String> labels, String series, List<Double> data) {
    return Chart.builder()
        .chartType(type)
        .chartData(
            ChartData.builder()
                .labels(labels)
                .datasets(List.of(ChartDataset.builder().label(series).data(data).build()))
                .build())
        .build();
  }
}
