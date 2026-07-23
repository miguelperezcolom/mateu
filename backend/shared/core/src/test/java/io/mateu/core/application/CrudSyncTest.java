package io.mateu.core.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;

/** Exploration scaffold for the AutoCrud lifecycle (to be replaced with precise assertions). */
class CrudSyncTest {

  public static class Item implements Identifiable {
    String id;
    String name;
    int units;
    boolean active;

    public Item() {}

    public Item(String id, String name, int units, boolean active) {
      this.id = id;
      this.name = name;
      this.units = units;
      this.active = active;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return id + " " + name;
    }
  }

  static final List<Item> ITEMS = new ArrayList<>();

  static CrudRepository<Item> itemsRepository() {
    return new CrudRepository<>() {
      @Override
      public Optional<Item> findById(String id) {
        return ITEMS.stream().filter(item -> item.id().equals(id)).findFirst();
      }

      @Override
      public String save(Item entity) {
        if (entity.id == null || entity.id.isBlank()) {
          entity.id = UUID.randomUUID().toString();
          ITEMS.add(entity);
        } else {
          var existing = findById(entity.id);
          if (existing.isPresent()) {
            ITEMS.replaceAll(item -> item.id().equals(entity.id()) ? entity : item);
          } else {
            ITEMS.add(entity);
          }
        }
        return entity.id;
      }

      @Override
      public List<Item> findAll() {
        return ITEMS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        ITEMS.removeIf(item -> selectedIds.contains(item.id()));
      }
    };
  }

  @UI("/items")
  @Title("Items")
  public static class ItemsCrud extends AutoCrud<Item> {
    @Override
    public GridLayout gridLayout() {
      return GridLayout.table;
    }

    @Override
    public CrudRepository<Item> store() {
      return itemsRepository();
    }
  }

  public static class StockItem implements Identifiable {
    @ReadOnly String id;
    String product;
    int units;

    public StockItem() {}

    public StockItem(String id, String product, int units) {
      this.id = id;
      this.product = product;
      this.units = units;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<StockItem> STOCK = new ArrayList<>();

  @UI("/stock")
  @Title("Stock")
  @InlineEditing
  public static class StockCrud extends AutoCrud<StockItem> {
    @Override
    public GridLayout gridLayout() {
      return GridLayout.table;
    }

    @Override
    public String newLabel() {
      return "Añadir";
    }

    @Override
    public String deleteLabel() {
      return "Borrar";
    }

    @Override
    public String saveLabel() {
      return "Guardar";
    }

    @Override
    public String cancelLabel() {
      return "Volver";
    }

    @Override
    public CrudRepository<StockItem> store() {
      return new CrudRepository<>() {
        @Override
        public Optional<StockItem> findById(String id) {
          return STOCK.stream().filter(item -> item.id().equals(id)).findFirst();
        }

        @Override
        public String save(StockItem entity) {
          if (entity.id == null || entity.id.isBlank()) {
            entity.id = UUID.randomUUID().toString();
            STOCK.add(entity);
          } else {
            STOCK.replaceAll(item -> item.id().equals(entity.id()) ? entity : item);
          }
          return entity.id;
        }

        @Override
        public List<StockItem> findAll() {
          return STOCK;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          STOCK.removeIf(item -> selectedIds.contains(item.id()));
        }
      };
    }
  }

  public record ItemFilters(Boolean activeOnly) {}

  @UI("/filtered-items")
  @Title("Filtered items")
  public static class FilteredItemsCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.FilteredAutoCrud<
          ItemFilters, Item> {
    @Override
    public Class filtersClass() {
      return ItemFilters.class;
    }

    @Override
    public io.mateu.uidl.data.ListingData<Item> fetchRows(
        String searchText,
        ItemFilters filters,
        io.mateu.uidl.data.Pageable pageable,
        io.mateu.uidl.interfaces.HttpRequest httpRequest) {
      if (filters != null && Boolean.TRUE.equals(filters.activeOnly())) {
        var rows = ITEMS.stream().filter(item -> item.active).toList();
        return new io.mateu.uidl.data.ListingData<>(
            new io.mateu.uidl.data.Page<>(searchText, rows.size(), 0, rows.size(), rows));
      }
      return super.fetchRows(searchText, filters, pageable, httpRequest);
    }

    @Override
    public CrudRepository<Item> store() {
      return itemsRepository();
    }
  }

  static TestMateu mateu;
  static ObjectMapper json;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ItemsCrud.class, StockCrud.class, FilteredItemsCrud.class);
    json = mateu.context().getBean(ObjectMapper.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void resetData() {
    ITEMS.clear();
    ITEMS.add(new Item("1", "Hammer", 10, true));
    ITEMS.add(new Item("2", "Screwdriver", 25, true));
    ITEMS.add(new Item("3", "Wrench", 5, false));
    STOCK.clear();
    STOCK.add(new StockItem("s1", "Widget", 120));
    STOCK.add(new StockItem("s2", "Gadget", 43));
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private UIIncrementDto crud(String route, String actionId) {
    return crud(route, actionId, Map.of(), null);
  }

  private UIIncrementDto crud(
      String route, String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/items")
            .serverSideType(ItemsCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private UIIncrementDto stock(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/stock")
            .consumedRoute("/stock")
            .serverSideType(StockCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c2_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  @SuppressWarnings("unchecked")
  private static io.mateu.uidl.data.Page<Object> pageOf(UIIncrementDto increment) {
    // In-JVM the search Data still carries the TYPED ListingData under "crud" (Jackson only
    // flattens it at the HTTP boundary).
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data
          && data.get("crud") instanceof io.mateu.uidl.data.ListingData<?> listing) {
        return (io.mateu.uidl.data.Page<Object>) listing.page();
      }
    }
    return null;
  }

  private static List<?> content(UIIncrementDto increment) {
    var page = pageOf(increment);
    org.assertj.core.api.Assertions.assertThat(page).isNotNull();
    return page.content();
  }

  /** Filtered/sorted searches map rows to maps before returning; plain ones keep the entity. */
  private static String nameOf(Object row) {
    if (row instanceof Item item) {
      return item.name;
    }
    if (row instanceof Map<?, ?> map) {
      return String.valueOf(map.get("name"));
    }
    return String.valueOf(row);
  }

  // ── mediator + listing ──────────────────────────────────────────────────────

  @org.junit.jupiter.api.Test
  void syncOfTheCrudRouteReturnsItsMediatorApp() {
    var increment = mateu.sync("/items");
    var app =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.AppDto.class);
    org.assertj.core.api.Assertions.assertThat(app).isNotNull();
    org.assertj.core.api.Assertions.assertThat(app.variant())
        .isEqualTo(io.mateu.dtos.AppVariantDto.MEDIATOR);
    org.assertj.core.api.Assertions.assertThat(app.homeServerSideType())
        .isEqualTo(ItemsCrud.class.getName());
  }

  @org.junit.jupiter.api.Test
  void listingCarriesTheRowColumnsAndTheCrudActions() {
    var increment = crud("/items", "");
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    var columnIds = new ArrayList<String>();
    collectColumns(component, columnIds);
    org.assertj.core.api.Assertions.assertThat(columnIds).contains("id", "name", "units", "active");
    org.assertj.core.api.Assertions.assertThat(component.actions())
        .extracting(io.mateu.dtos.ActionDto::id)
        .contains("search", "delete", "update-row");
  }

  private static void collectColumns(Object component, List<String> ids) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof io.mateu.dtos.GridColumnDto column) {
        ids.add(column.id());
      }
      // the listing columns live inside the CrudlDto metadata, not as plain children
      if (client.metadata() instanceof io.mateu.dtos.CrudlDto crudl) {
        crudl.columns().forEach(column -> collectColumns(column, ids));
      }
      client.children().forEach(child -> collectColumns(child, ids));
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      server.children().forEach(child -> collectColumns(child, ids));
    }
  }

  // ── search ──────────────────────────────────────────────────────────────────

  @org.junit.jupiter.api.Test
  void searchReturnsAllRowsWithTotals() {
    var increment = crud("/items", "search", Map.of("page", 0, "size", 10, "searchText", ""), null);
    var page = pageOf(increment);
    org.assertj.core.api.Assertions.assertThat(page).isNotNull();
    org.assertj.core.api.Assertions.assertThat(page.totalElements()).isEqualTo(3L);
    org.assertj.core.api.Assertions.assertThat(content(increment)).hasSize(3);
  }

  @org.junit.jupiter.api.Test
  void searchPaginates() {
    var increment = crud("/items", "search", Map.of("page", 0, "size", 2, "searchText", ""), null);
    var page = pageOf(increment);
    org.assertj.core.api.Assertions.assertThat(content(increment)).hasSize(2);
    org.assertj.core.api.Assertions.assertThat(page.totalElements()).isEqualTo(3L);
  }

  @org.junit.jupiter.api.Test
  void searchFiltersBySearchableText() {
    var increment =
        crud("/items", "search", Map.of("page", 0, "size", 10, "searchText", "Hammer"), null);
    var rows = content(increment);
    org.assertj.core.api.Assertions.assertThat(rows).hasSize(1);
    org.assertj.core.api.Assertions.assertThat(nameOf(rows.get(0))).isEqualTo("Hammer");
  }

  @org.junit.jupiter.api.Test
  void searchSortsByFieldWireMapsIncluded() {
    // sort criteria arrive as JSON maps — SearchActionHandler must convert them to Sort records
    var increment =
        crud(
            "/items",
            "search",
            Map.of(
                "page",
                0,
                "size",
                10,
                "searchText",
                "",
                "sort",
                List.of(Map.of("field", "name", "direction", "descending"))),
            null);
    var names = content(increment).stream().map(CrudSyncTest::nameOf).toList();
    org.assertj.core.api.Assertions.assertThat(names)
        .containsExactly("Wrench", "Screwdriver", "Hammer");
  }

  @org.junit.jupiter.api.Test
  void searchMaterializesFiltersFromComponentState() {
    // filter values only travel in the component state — SearchActionHandler must build the
    // filtersClass() instance from it instead of passing null
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/filtered-items")
                .consumedRoute("/filtered-items")
                .serverSideType(FilteredItemsCrud.class.getName())
                .actionId("search")
                .initiatorComponentId("c3_app")
                .componentState(Map.of("page", 0, "size", 10, "searchText", "", "activeOnly", true))
                .build());
    var names = content(increment).stream().map(CrudSyncTest::nameOf).toList();
    org.assertj.core.api.Assertions.assertThat(names)
        .containsExactlyInAnyOrder("Hammer", "Screwdriver");
  }

  @org.junit.jupiter.api.Test
  void searchWithUncheckedFiltersReturnsAllRows() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/filtered-items")
                .consumedRoute("/filtered-items")
                .serverSideType(FilteredItemsCrud.class.getName())
                .actionId("search")
                .initiatorComponentId("c3_app")
                .componentState(Map.of("page", 0, "size", 10, "searchText", ""))
                .build());
    org.assertj.core.api.Assertions.assertThat(content(increment)).hasSize(3);
  }

  // ── create / edit / delete lifecycle ────────────────────────────────────────

  @org.junit.jupiter.api.Test
  void createPersistsANewEntity() {
    crud(
        "/items/new",
        "create",
        Map.of(),
        Map.of("initiatorState", Map.of("name", "Saw", "units", 7, "active", true)));
    org.assertj.core.api.Assertions.assertThat(ITEMS).hasSize(4);
    org.assertj.core.api.Assertions.assertThat(ITEMS.get(3).name).isEqualTo("Saw");
    org.assertj.core.api.Assertions.assertThat(ITEMS.get(3).id).isNotBlank();
  }

  @org.junit.jupiter.api.Test
  void saveWithComponentStateOnlyPersistsTheEdit() {
    // no parameters at all: toEntity must fall back to the componentState
    crud(
        "/items/1/edit",
        "save",
        Map.of("id", "1", "name", "Sledgehammer", "units", 11, "active", false),
        null);
    org.assertj.core.api.Assertions.assertThat(ITEMS.get(0).name).isEqualTo("Sledgehammer");
    org.assertj.core.api.Assertions.assertThat(ITEMS.get(0).units).isEqualTo(11);
    org.assertj.core.api.Assertions.assertThat(ITEMS.get(0).active).isFalse();
  }

  @org.junit.jupiter.api.Test
  void deleteRemovesTheSelectedRows() {
    crud(
        "/items",
        "delete",
        Map.of("crud_selected_items", List.of(Map.of("id", "2", "name", "Screwdriver"))),
        null);
    org.assertj.core.api.Assertions.assertThat(ITEMS).hasSize(2);
    org.assertj.core.api.Assertions.assertThat(ITEMS.stream().map(Item::id)).doesNotContain("2");
  }

  @org.junit.jupiter.api.Test
  void viewRouteRendersTheEntityReadOnly() {
    var increment = crud("/items/1", "");
    var state = stateOf(increment);
    org.assertj.core.api.Assertions.assertThat(state)
        .containsEntry("name", "Hammer")
        .containsEntry("units", 10);
  }

  @org.junit.jupiter.api.Test
  void editRouteRendersTheEditor() {
    var increment = crud("/items/1/edit", "");
    var state = stateOf(increment);
    org.assertj.core.api.Assertions.assertThat(state).containsEntry("name", "Hammer");
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) state;
      }
    }
    return Map.of();
  }

  // ── inline editing (@InlineEditing) ─────────────────────────────────────────

  @org.junit.jupiter.api.Test
  void inlineEditingMarksDataColumnsEditable() {
    var increment = stock("", Map.of(), null);
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    var columns = new ArrayList<io.mateu.dtos.GridColumnDto>();
    collectColumnDtos(component, columns);
    org.assertj.core.api.Assertions.assertThat(columns)
        .filteredOn(column -> "units".equals(column.id()))
        .allMatch(io.mateu.dtos.GridColumnDto::editable);
    // @ReadOnly id column stays display-only
    org.assertj.core.api.Assertions.assertThat(columns)
        .filteredOn(column -> "id".equals(column.id()))
        .noneMatch(io.mateu.dtos.GridColumnDto::editable);
  }

  private static void collectColumnDtos(Object component, List<io.mateu.dtos.GridColumnDto> out) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof io.mateu.dtos.GridColumnDto column) {
        out.add(column);
      }
      if (client.metadata() instanceof io.mateu.dtos.CrudlDto crudl) {
        crudl.columns().forEach(column -> collectColumnDtos(column, out));
      }
      client.children().forEach(child -> collectColumnDtos(child, out));
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      server.children().forEach(child -> collectColumnDtos(child, out));
    }
  }

  @org.junit.jupiter.api.Test
  void updateRowPersistsTheEditedRowImmediately() {
    stock(
        "update-row",
        Map.of(),
        Map.of("_editedRow", Map.of("id", "s1", "product", "Widget XL", "units", 130)));
    org.assertj.core.api.Assertions.assertThat(STOCK.get(0).units).isEqualTo(130);
    org.assertj.core.api.Assertions.assertThat(STOCK.get(0).product).isEqualTo("Widget XL");
  }

  // ── custom button labels ────────────────────────────────────────────────────

  @org.junit.jupiter.api.Test
  void customCrudLabelsReplaceTheBuiltInOnes() {
    var increment = stock("", Map.of(), null);
    var buttons = new ArrayList<io.mateu.dtos.ButtonDto>();
    collectButtons(increment.fragments().get(0).component(), buttons);
    org.assertj.core.api.Assertions.assertThat(buttons)
        .extracting(io.mateu.dtos.ButtonDto::label)
        .contains("Añadir", "Borrar");
  }

  private static void collectButtons(Object component, List<io.mateu.dtos.ButtonDto> out) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof io.mateu.dtos.ButtonDto button) {
        out.add(button);
      }
      if (client.metadata() instanceof io.mateu.dtos.PageDto pageDto) {
        // page toolbar buttons live in the metadata, not the children
        if (pageDto.toolbar() != null) {
          out.addAll(pageDto.toolbar());
        }
      }
      if (client.metadata() instanceof io.mateu.dtos.CrudlDto crudl) {
        if (crudl.toolbar() != null) {
          out.addAll(crudl.toolbar());
        }
      }
      client.children().forEach(child -> collectButtons(child, out));
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      server.children().forEach(child -> collectButtons(child, out));
    }
  }
}
