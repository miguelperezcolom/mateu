package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Two things a custom {@link Listing} declares that the renderers must find where the server puts
 * them: an {@link Amount} row field is a MONEY column (it used to be "string" and the web wrote the
 * object as "[object Object]"), and {@link ListingData#emptyStateMessage()} travels in the search
 * answer's data, next to the page (the web read it from the state and never showed it).
 */
class ListingAmountAndEmptyMessageSyncTest {

  public record StockRow(String product, int units, Amount value) {}

  @UI("/stock-values")
  @Title("Stock")
  public static class StockListing implements Listing<StockRow> {
    @Override
    public ListingData<StockRow> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of(new StockRow("Milk", 12, new Amount("EUR", 14.4, "es-ES")));
    }
  }

  @UI("/empty-stock")
  @Title("Empty stock")
  public static class EmptyStockListing implements Listing<StockRow> {
    @Override
    public ListingData<StockRow> search(SearchRequest request, HttpRequest httpRequest) {
      return new ListingData<>(
          new Page<>("", 0, 0, 0, List.of()), "Pick a warehouse on the header");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(StockListing.class, EmptyStockListing.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(Class<?> ui, String route, String actionId) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(ui.getName())
            .actionId(actionId)
            .initiatorComponentId("stock_app")
            .componentState(Map.of())
            .parameters(Map.of("crudId", "crud"))
            .build());
  }

  @Test
  void anAmountRowFieldIsAMoneyColumn() {
    var found = new ArrayList<CrudlDto>();
    run(StockListing.class, "/stock-values", "")
        .fragments()
        .forEach(f -> FieldKindsSyncTest.walk(f.component(), CrudlDto.class, found));
    assertThat(found).isNotEmpty();
    var columns = new ArrayList<GridColumnDto>();
    found.get(0).columns().forEach(c -> FieldKindsSyncTest.walk(c, GridColumnDto.class, columns));
    var value = columns.stream().filter(c -> "value".equals(c.id())).findFirst().orElseThrow();
    assertThat(String.valueOf(value.dataType())).isEqualTo("money");
    assertThat(value.align()).isEqualTo("end");
  }

  @Test
  @SuppressWarnings("unchecked")
  void theRowsCarryTheAmountWithItsCurrencyAndLocale() throws Exception {
    var increment = run(StockListing.class, "/stock-values", "search");
    var json = new ObjectMapper().writeValueAsString(increment);
    assertThat(json)
        .contains("\"currency\":\"EUR\"")
        .contains("\"value\":14.4")
        .contains("\"locale\":\"es-ES\"");
  }

  @Test
  void theEmptyStateMessageTravelsInTheSearchAnswersData() throws Exception {
    var increment = run(EmptyStockListing.class, "/empty-stock", "search");
    var data =
        increment.fragments().stream()
            .map(f -> f.data())
            .filter(d -> d instanceof Map<?, ?> m && !m.isEmpty())
            .findFirst()
            .orElseThrow();
    var json = new ObjectMapper().writeValueAsString(data);
    assertThat(json).contains("\"emptyStateMessage\":\"Pick a warehouse on the header\"");
  }
}
