package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TabDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Subresource;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @Subresource}: a record's sub-listings stacked in its tabs, with the parent as context,
 * lazy by default, counted on the tab when eager — and the {@code @Inline} traps that used to
 * reload forever now failing where the cause is.
 */
class SubresourceSyncTest {

  public static class Item implements Identifiable {
    public String id;
    public String vcnId;

    public Item() {}

    Item(String id, String vcnId) {
      this.id = id;
      this.vcnId = vcnId;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Item> SUBNETS =
      List.of(new Item("s1", "7"), new Item("s2", "7"), new Item("s3", "7"), new Item("s4", "8"));

  public abstract static class ItemsOfVcn extends AutoCrud<Item> {
    public String vcnId;

    public abstract List<Item> all();

    @Override
    public CrudStore<Item> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Item> findById(String id) {
          return all().stream().filter(i -> i.id.equals(id)).findFirst();
        }

        @Override
        public String save(Item entity) {
          return entity.id;
        }

        @Override
        public List<Item> findAll() {
          return all().stream().filter(i -> i.vcnId.equals(vcnId)).toList();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  @Title("Internet gateways")
  public static class InternetGateways extends ItemsOfVcn {
    @Override
    public List<Item> all() {
      return List.of(new Item("ig1", "7"));
    }
  }

  @Title("NAT gateways")
  public static class NatGateways extends ItemsOfVcn {
    @Override
    public List<Item> all() {
      return List.of(new Item("nat1", "7"), new Item("nat2", "8"));
    }
  }

  @Title("Subnets")
  public static class Subnets extends ItemsOfVcn {
    @Override
    public List<Item> all() {
      return SUBNETS;
    }
  }

  /** The VCN detail: Details, then Gateways (two listings, stacked) and Subnets (eager). */
  public static class VcnDetail {
    @ReadOnly public String id;

    @Tab(value = "Details", key = "details")
    public String cidr = "10.0.0.0/16";

    @Subresource(tab = "gateways", order = 2, context = "vcnId=id")
    public NatGateways nat;

    @Subresource(
        tab = "gateways",
        order = 1,
        help = "Gateways to the internet",
        context = "vcnId=id")
    public InternetGateways internet;

    @Subresource(tab = "subnets", load = Subresource.Load.EAGER, context = "vcnId=id")
    public Subnets subnets;
  }

  /** The trap: an @Inline orchestrator with no route of its own. */
  public static class TrappedHost {
    public String name;

    @Inline public NatGateways nat;
  }

  /** The other trap: nothing editable but an orchestrator — it is still a form. */
  public static class OnlyAnOrchestrator {
    @ReadOnly public String id;

    @Subresource public Subnets subnets;
  }

  public static class Routes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.of("_net/vcns/:id", VcnDetail.class.getName()),
          RouteEntry.of("_net/trap", TrappedHost.class.getName()),
          RouteEntry.of("_net/only/:id", OnlyAnOrchestrator.class.getName()));
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

  private static void walk(Object node, Consumer<Object> visitor) {
    walk(node, visitor, new IdentityHashMap<>());
  }

  private static void walk(
      Object node, Consumer<Object> visitor, IdentityHashMap<Object, Boolean> seen) {
    if (node == null || seen.put(node, true) != null) {
      return;
    }
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

  /** The tabs of the page, each with the islands and texts inside it, in order. */
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
                  if (inner instanceof ServerSideComponentDto island) {
                    islands.add(island);
                  }
                  if (inner instanceof ClientSideComponentDto t
                      && t.metadata() instanceof TextDto text) {
                    texts.add(text.text());
                  }
                });
            out.add(new TabContent(tab, islands, texts));
          }
        });
    return out;
  }

  record TabContent(TabDto tab, List<ServerSideComponentDto> islands, List<String> texts) {}

  private static TabContent tab(List<TabContent> tabs, String key) {
    return tabs.stream().filter(t -> key.equals(t.tab().routeKey())).findFirst().orElseThrow();
  }

  @Test
  void subresourcesGoToTheTabsTheyNameAfterTheDeclaredOnes() {
    var tabs = tabs(mateu.sync("/_net/vcns/7"));
    assertThat(tabs)
        .extracting(t -> t.tab().routeKey())
        .containsExactly("details", "gateways", "subnets");
    assertThat(tabs)
        .extracting(t -> t.tab().label())
        .containsExactly("Details", "Gateways", "Subnets");
  }

  @Test
  void severalSubresourcesStackInOneTabInTheirOrder() {
    var gateways = tab(tabs(mateu.sync("/_net/vcns/7")), "gateways");
    assertThat(gateways.islands())
        .extracting(ServerSideComponentDto::serverSideType)
        .containsExactly(InternetGateways.class.getName(), NatGateways.class.getName());
    // each with its own title, and the help line where declared
    assertThat(gateways.texts())
        .containsSubsequence("Internet gateways", "Gateways to the internet", "NAT gateways");
  }

  @Test
  void theParentReachesTheListingAsContext() {
    var gateways = tab(tabs(mateu.sync("/_net/vcns/7")), "gateways");
    assertThat(gateways.islands())
        .allSatisfy(
            island -> assertThat(((Map<?, ?>) island.initialData()).get("vcnId")).isEqualTo("7"));
  }

  @Test
  void aSubresourceIsLazyByDefaultAndItsListingDrawsNoTitleOfItsOwn() {
    var gateways = tab(tabs(mateu.sync("/_net/vcns/7")), "gateways");
    assertThat(gateways.islands())
        .allSatisfy(
            island -> {
              assertThat(island.route())
                  .contains("_lazy=1")
                  .contains("_hideTitle=1")
                  .contains("_scope=vcnId");
            });
  }

  @Test
  void anEagerSubresourceLoadsWithThePageAndCountsItsRowsOnTheTab() {
    var subnets = tab(tabs(mateu.sync("/_net/vcns/7")), "subnets");
    assertThat(subnets.islands()).hasSize(1);
    assertThat(subnets.islands().get(0).route()).doesNotContain("_lazy=1");
    assertThat(subnets.tab().badge()).isEqualTo("3");
    // alone in its tab: the tab is its label, so the listing is not labelled again
    assertThat(subnets.texts()).doesNotContain("Subnets");
  }

  @Test
  void theParentsContextIsTheListingsFixedScope() {
    var island = tab(tabs(mateu.sync("/_net/vcns/7")), "subnets").islands().get(0);
    var listing =
        mateu.run(
            io.mateu.dtos.RunActionRqDto.builder()
                .route(island.route())
                .consumedRoute(island.route().substring(0, island.route().indexOf('?')))
                .serverSideType(Subnets.class.getName())
                .actionId("")
                .initiatorComponentId("isl")
                .componentState(
                    Map.of(
                        "vcnId",
                        "7",
                        "_route",
                        "",
                        "_componentRoute",
                        island.route().substring(0, island.route().indexOf('?'))))
                .parameters(Map.of())
                .build());
    var filters = new ArrayList<io.mateu.dtos.FormFieldDto>();
    walk(
        listing,
        node -> {
          if (node instanceof io.mateu.dtos.CrudlDto crudl) {
            filters.addAll(crudl.filters());
          }
        });
    assertThat(filters)
        .filteredOn(f -> "vcnId".equals(f.fieldId()))
        .isNotEmpty()
        .allMatch(io.mateu.dtos.FormFieldDto::readOnly);
  }

  @Test
  void aSubresourceNeedsNoRouteOfItsOwn() {
    var subnets = tab(tabs(mateu.sync("/_net/vcns/7")), "subnets");
    assertThat(subnets.islands().get(0).route()).startsWith("/_subresource/VcnDetail/subnets");
  }

  @Test
  void anInlineOrchestratorWithNoRouteFailsLoudlyInsteadOfReloadingForever() {
    // a configuration error for the developer: its text shows in development (detailed errors);
    // in production the user gets the generic error and the log carries the text
    System.setProperty(io.mateu.core.application.runaction.ErrorBoundary.DETAILED, "true");
    try {
      var increment = mateu.sync("/_net/trap");
      assertThat(increment.messages()).isNotEmpty();
      assertThat(increment.messages().get(0).text()).contains("no route of its own");
    } finally {
      System.clearProperty(io.mateu.core.application.runaction.ErrorBoundary.DETAILED);
    }
  }

  @Test
  void aClassHoldingOnlyAnOrchestratorIsStillAFormAndRendersItsIsland() {
    var islands = new ArrayList<ServerSideComponentDto>();
    walk(
        mateu.sync("/_net/only/7"),
        node -> {
          if (node instanceof ServerSideComponentDto island
              && Subnets.class.getName().equals(island.serverSideType())) {
            islands.add(island);
          }
        });
    assertThat(islands).hasSize(1);
  }
}
