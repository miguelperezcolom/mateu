package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A view embedded in another page with {@code EmbeddedView} behaves as it does as a page of its own
 * (found building the Mateu Explorer, 3.0-beta.51): a lookup shows its label, not the stored id,
 * and an inferred dashboard's metric card runs the class's action.
 */
class EmbeddedIslandBehaviourSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @Title("Booking")
  public static class BookingForm {

    @Lookup(search = Guests.class, label = Guests.class)
    public String guestId = "g2";

    @Button
    public Message book() {
      return Message.success("Booking for guest id " + guestId);
    }
  }

  public static class Guests implements LookupOptionsSupplier, LookupLabelSupplier {

    static final List<Option> ALL =
        List.of(new Option("g1", "Ada Lovelace"), new Option("g2", "Alan Turing"));

    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.of(ALL);
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      return ALL.stream()
          .filter(o -> o.value().equals(id))
          .map(Option::label)
          .findFirst()
          .orElse("" + id);
    }
  }

  @Title("Front desk board")
  public static class FrontDeskBoard {

    public MetricCard arrivals =
        MetricCard.builder().title("Arrivals").value("12").actionId("openArrivals").build();

    public MetricCard departures = MetricCard.builder().title("Departures").value("9").build();

    public Message openArrivals() {
      return Message.success("Drilling into today's 12 arrivals");
    }
  }

  @UI("/island-host-lookup")
  public static class LookupHost implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(List.of(new Text("host"), new EmbeddedView(new BookingForm())))
          .build();
    }
  }

  @UI("/island-host-board")
  public static class BoardHost implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(List.of(new Text("host"), new EmbeddedView(new FrontDeskBoard())))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(LookupHost.class, BoardHost.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** The server-side islands of the given type, anywhere in the answer. */
  private static List<JsonNode> islandsOf(JsonNode node, String type) {
    var found = new ArrayList<JsonNode>();
    collect(node, type, found);
    return found;
  }

  private static void collect(JsonNode node, String type, List<JsonNode> found) {
    if (node == null) return;
    if (node.isObject()) {
      if ("ServerSide".equals(node.path("type").asText())
          && type.equals(node.path("serverSideType").asText())) {
        found.add(node);
      }
      node.elements().forEachRemaining(child -> collect(child, type, found));
    } else if (node.isArray()) {
      node.elements().forEachRemaining(child -> collect(child, type, found));
    }
  }

  @Test
  void anEmbeddedInferredDashboardAdvertisesAndRunsItsMetricCardAction() {
    var wire = JSON.valueToTree(mateu.sync("/island-host-board"));
    var islands = islandsOf(wire, FrontDeskBoard.class.getName());
    assertThat(islands).hasSize(1);
    var island = islands.get(0);
    // composed as a dashboard, as the class is on a page of its own
    assertThat(island.path("pageType").asText()).isEqualTo("dashboard");
    assertThat(island.toString()).contains("\"Scoreboard\"");
    var advertised = new ArrayList<String>();
    island.path("actions").forEach(a -> advertised.add(a.path("id").asText()));
    assertThat(advertised).contains("openArrivals");

    var answer =
        JSON.valueToTree(
                mateu.run(
                    RunActionRqDto.builder()
                        .route("/island-host-board")
                        .consumedRoute("")
                        .serverSideType(FrontDeskBoard.class.getName())
                        .actionId("openArrivals")
                        .componentState(Map.of())
                        .initiatorComponentId(island.path("id").asText())
                        .build()))
            .toString();
    assertThat(answer).contains("Drilling into today's 12 arrivals");
  }
}
