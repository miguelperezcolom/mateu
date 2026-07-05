package io.mateu.core.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
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
import org.junit.jupiter.api.Test;

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
    public CrudRepository<Item> repository() {
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
    public CrudRepository<StockItem> repository() {
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

  static TestMateu mateu;
  static ObjectMapper json;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ItemsCrud.class, StockCrud.class);
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

  private static void dump(String label, Object obj) throws Exception {
    System.out.println("========== " + label + " ==========");
    System.out.println(json.writerWithDefaultPrettyPrinter().writeValueAsString(obj));
  }

  @Test
  void explore() throws Exception {
    dump("MEDIATOR sync /items", mateu.sync("/items"));

    dump(
        "LIST /items",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1")
                .build()));

    dump(
        "SEARCH",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("search")
                .initiatorComponentId("c1")
                .componentState(Map.of("page", 0, "size", 2, "searchText", ""))
                .build()));

    dump(
        "NEW /items/new",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items/new")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1")
                .build()));

    dump(
        "CREATE",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items/new")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("create")
                .initiatorComponentId("c1")
                .componentState(Map.of("name", "Saw", "units", 7, "active", true))
                .build()));

    dump(
        "VIEW /items/1",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items/1")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1")
                .build()));

    dump(
        "EDIT /items/1/edit",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items/1/edit")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1")
                .build()));

    dump(
        "SAVE",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items/1/edit")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("save")
                .initiatorComponentId("c1")
                .componentState(
                    Map.of("id", "1", "name", "Sledgehammer", "units", 11, "active", false))
                .build()));

    dump(
        "DELETE",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("delete")
                .initiatorComponentId("c1")
                .componentState(
                    Map.of(
                        "crud_selected_items", List.of(Map.of("id", "2", "name", "Screwdriver"))))
                .build()));
    System.out.println("ITEMS after delete: " + ITEMS.size());

    dump(
        "STOCK LIST (inline editing)",
        mateu.run(
            RunActionRqDto.builder()
                .route("/stock")
                .consumedRoute("/stock")
                .serverSideType(StockCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c2")
                .build()));

    dump(
        "UPDATE-ROW",
        mateu.run(
            RunActionRqDto.builder()
                .route("/stock")
                .consumedRoute("/stock")
                .serverSideType(StockCrud.class.getName())
                .actionId("update-row")
                .initiatorComponentId("c2")
                .parameters(
                    Map.of("_editedRow", Map.of("id", "s1", "product", "Widget XL", "units", 130)))
                .build()));
    System.out.println(
        "STOCK s1 units: " + STOCK.get(0).units + " product: " + STOCK.get(0).product);

    dump(
        "CANCEL-EDIT",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items/1/edit")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("cancel-edit")
                .initiatorComponentId("c1")
                .componentState(Map.of("id", "1"))
                .build()));

    dump(
        "SEARCH sorted desc",
        mateu.run(
            RunActionRqDto.builder()
                .route("/items")
                .consumedRoute("/items")
                .serverSideType(ItemsCrud.class.getName())
                .actionId("search")
                .initiatorComponentId("c1")
                .componentState(
                    Map.of(
                        "page",
                        0,
                        "size",
                        10,
                        "searchText",
                        "",
                        "sort",
                        List.of(Map.of("field", "name", "direction", "descending"))))
                .build()));
  }
}
