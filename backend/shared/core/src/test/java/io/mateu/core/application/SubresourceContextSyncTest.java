package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.SubresourceSyncTest.Item;
import io.mateu.core.application.SubresourceSyncTest.ItemsOfVcn;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TabDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Subresource;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Where a {@code @Subresource} gets its context from without an explicit binding — a parent field
 * named like a listing field, or a path parameter of the route — and where it lands: in a tab the
 * page already declares (matched by name), or a tab of its own, titled after the field when the
 * listing has no {@code @Title}.
 */
class SubresourceContextSyncTest {

  /** No @Title: its island is titled after the field. */
  public static class Peers extends ItemsOfVcn {
    @Override
    public List<Item> all() {
      return List.of(new Item("p1", "5"), new Item("p2", "5"), new Item("p3", "9"));
    }
  }

  public static class NetHost {
    @ReadOnly public String id;

    public String vcnId = "9"; // named like the listing's field: implicit context

    @Tab("Network")
    public String cidr = "10.1.0.0/16";

    @Tab("Network")
    public String region = "eu";

    @Subresource(tab = "Network")
    public Peers peers;
  }

  public static class PathHost {
    @ReadOnly public String id;

    @Subresource(load = Subresource.Load.EAGER)
    public Peers peers;
  }

  public static class Routes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.of("_net2/hosts/:id", NetHost.class.getName()),
          RouteEntry.of("_net2/vcns/:vcnId/peers-host", PathHost.class.getName()));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Routes()));
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  record TabContent(TabDto tab, List<ServerSideComponentDto> islands, List<String> texts) {}

  private static void walk(
      Object node, Consumer<Object> visitor, IdentityHashMap<Object, Boolean> seen) {
    if (node == null || seen.put(node, true) != null) return;
    visitor.accept(node);
    if (node instanceof Iterable<?> it) {
      it.forEach(child -> walk(child, visitor, seen));
    } else if (node instanceof Map<?, ?> map) {
      map.values().forEach(child -> walk(child, visitor, seen));
    } else if (node.getClass().isRecord()) {
      for (var component : node.getClass().getRecordComponents()) {
        try {
          walk(component.getAccessor().invoke(node), visitor, seen);
        } catch (Exception ignored) {
          // skip
        }
      }
    }
  }

  private static List<TabContent> tabs(UIIncrementDto increment) {
    var out = new ArrayList<TabContent>();
    walk(
        increment,
        node -> {
          if (node instanceof ClientSideComponentDto c && c.metadata() instanceof TabDto tab) {
            var islands = new ArrayList<ServerSideComponentDto>();
            var texts = new ArrayList<String>();
            walk(
                c.children(),
                inner -> {
                  if (inner instanceof ServerSideComponentDto island) islands.add(island);
                  if (inner instanceof ClientSideComponentDto t
                      && t.metadata() instanceof TextDto x) texts.add(x.text());
                },
                new IdentityHashMap<>());
            out.add(new TabContent(tab, islands, texts));
          }
        },
        new IdentityHashMap<>());
    return out;
  }

  @Test
  void aSubresourceJoinsTheDeclaredTabOfTheSameNameWithTheParentsSameNamedFieldAsContext() {
    var tabs = tabs(mateu.sync("/_net2/hosts/1"));
    assertThat(tabs).extracting(t -> t.tab().label()).containsExactly("Network");
    var network = tabs.get(0);
    assertThat(network.islands())
        .singleElement()
        .satisfies(
            island -> {
              assertThat(island.serverSideType()).isEqualTo(Peers.class.getName());
              assertThat(((Map<?, ?>) island.initialData()).get("vcnId")).isEqualTo("9");
            });
    // sharing the tab with other fields, the island is titled — after its field, as it has no
    // @Title
    assertThat(network.texts()).contains("Peers");
  }

  @Test
  void aPathParameterNamedLikeAListingFieldIsItsContextAndScopesTheCount() {
    var tabs = tabs(mateu.sync("/_net2/vcns/5/peers-host"));
    var peers =
        tabs.stream().filter(t -> "Peers".equals(t.tab().label())).findFirst().orElseThrow();
    var island = peers.islands().get(0);
    assertThat(((Map<?, ?>) island.initialData()).get("vcnId")).isEqualTo("5");
    assertThat(island.route()).contains("_scope=vcnId");
    assertThat(peers.tab().badge()).isEqualTo("2");
  }
}
