package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FutureComponent;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A {@link FutureComponent} is an island like an {@code EmbeddedView}: its instance's own tree (a
 * component tree's {@code component()}), its state field by field and its own actions. It used to
 * render the instance reflectively — a component tree's {@code component()} was never called — with
 * the raw object as its state (so fields without getters arrived empty) and without its actions.
 */
class FutureComponentIslandSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public static class GiftShop implements ComponentTreeSupplier {
    int stock = 3;

    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          List.of(
              new Text("Postcards in stock: ${state.stock}"),
              Button.builder().label("Sell one").actionId("sellOne").build()));
    }

    public Object sellOne() {
      stock--;
      return this;
    }
  }

  @UI("/future-component-host")
  public static class Host implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(List.<Component>of(new FutureComponent(new GiftShop())));
    }
  }

  private static List<JsonNode> islandsOf(JsonNode node, String type) {
    var found = new ArrayList<JsonNode>();
    collect(node, type, found);
    return found;
  }

  private static void collect(JsonNode node, String type, List<JsonNode> found) {
    if (node == null) return;
    if (node.isObject()) {
      if ("ServerSide".equals(node.path("type").asText())
          && type.equals(node.path("serverSideType").asText())) found.add(node);
      node.elements().forEachRemaining(child -> collect(child, type, found));
    } else if (node.isArray()) {
      node.elements().forEachRemaining(child -> collect(child, type, found));
    }
  }

  @Test
  void aFutureComponentOfAComponentTreeIsAnIslandWithItsTreeStateAndActions() {
    try (var mateu = TestMateu.withUis(Host.class)) {
      JsonNode wire = JSON.valueToTree(mateu.sync("/future-component-host"));
      var islands = islandsOf(wire, GiftShop.class.getName());
      assertThat(islands).hasSize(1);
      var island = islands.get(0);
      // its component() was called: the tree it returns is drawn
      assertThat(island.toString()).contains("Postcards in stock").contains("Sell one");
      // its state field by field (no getter for stock)
      assertThat(island.path("initialData").path("stock").asInt()).isEqualTo(3);
      // its own action is advertised on the island
      assertThat(island.path("actions").toString()).contains("sellOne");
    }
  }
}
