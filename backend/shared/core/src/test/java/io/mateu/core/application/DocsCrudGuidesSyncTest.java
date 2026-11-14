package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The CRUD snippets of the Java guides, as the docs print them, driven through New → create (GA
 * review 2, S1: since 3.0-beta.65 a crud's plain {@code id} is technical, and the guides kept
 * teaching a store keyed by an id nobody assigned, so following them gave a refused create). Each
 * nested class names the page it comes from; change both together.
 */
class DocsCrudGuidesSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  // ── java-user-manual/use-cases/users-crud.md ───────────────────────────────────────────────

  public record User(
      String id,
      @NotEmpty String name,
      @NotEmpty @Email String email,
      @Stereotype(FieldStereotype.checkbox)
          @Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
          List<String> roles)
      implements Identifiable {

    @Override
    public String toString() {
      return name != null ? name : "New user";
    }
  }

  public static class UserStore implements CrudStore<User> {

    private static final Map<String, User> db = new ConcurrentHashMap<>();

    static {
      db.put("1", new User("1", "Miguel", "miguel@example.com", List.of("1", "2")));
      db.put("2", new User("2", "Ana", "ana@example.com", List.of("2")));
    }

    @Override
    public Optional<User> findById(String id) {
      return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(User entity) {
      // a new user arrives without an id: the store assigns it
      var user =
          entity.id() == null || entity.id().isBlank()
              ? new User(
                  UUID.randomUUID().toString(), entity.name(), entity.email(), entity.roles())
              : entity;
      db.put(user.id(), user);
      return user.id();
    }

    @Override
    public List<User> findAll() {
      return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
      selectedIds.forEach(db::remove);
    }
  }

  @UI("/docs-users")
  public static class UsersPage extends AutoCrud<User> {

    final UserStore userStore;

    public UsersPage(UserStore userStore) {
      this.userStore = userStore;
    }

    @Override
    public CrudStore<User> store() {
      return userStore;
    }
  }

  public static class RoleOptionsSupplier implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.of(
          List.of(new Option("1", "Admin"), new Option("2", "Editor"), new Option("3", "Viewer")));
    }
  }

  public static class RoleLabelSupplier implements LookupLabelSupplier {
    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      return switch (String.valueOf(id)) {
        case "1" -> "Admin";
        case "2" -> "Editor";
        case "3" -> "Viewer";
        default -> "?";
      };
    }
  }

  // ── java-ui-definition/interfaces/crud-store.md ────────────────────────────────────────────

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Item implements Identifiable {

    String id;
    String name;
    double price;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name != null ? "Item " + name : "New item";
    }
  }

  static class ItemStore implements CrudStore<Item> {

    private static final Map<String, Item> db =
        new HashMap<>(
            Map.of(
                "1", new Item("1", "Widget A", 9.99),
                "2", new Item("2", "Widget B", 19.99)));

    @Override
    public Optional<Item> findById(String id) {
      return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Item entity) {
      // `id` is technical: a new item arrives without one and the store assigns it
      if (entity.getId() == null || entity.getId().isBlank())
        entity.setId(UUID.randomUUID().toString());
      db.put(entity.getId(), entity);
      return entity.getId();
    }

    @Override
    public List<Item> findAll() {
      return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
      selectedIds.forEach(db::remove);
    }
  }

  @UI("/docs-items")
  public static class ItemsCatalog extends AutoCrud<Item> {
    @Override
    public CrudStore<Item> store() {
      return new ItemStore();
    }
  }

  // ── start-here/choose-your-path.mdx (the quickstart's Product) ─────────────────────────────

  public enum ProductStatus {
    Available,
    OutOfStock,
    Discontinued
  }

  public record Product(
      @EditableOnlyWhenCreating @NotEmpty String id,
      @NotEmpty String name,
      @Min(0) @Stereotype(FieldStereotype.money) double price,
      @NotNull ProductStatus status)
      implements Identifiable {}

  static final Map<String, Product> PRODUCTS = new ConcurrentHashMap<>();

  /** The quickstart's store: keyed by the id as it comes (the user types it). */
  static final CrudStore<Product> PRODUCT_STORE =
      new CrudStore<>() {
        @Override
        public Optional<Product> findById(String id) {
          return Optional.ofNullable(PRODUCTS.get(id));
        }

        @Override
        public String save(Product product) {
          PRODUCTS.put(product.id(), product);
          return product.id();
        }

        @Override
        public List<Product> findAll() {
          return List.copyOf(PRODUCTS.values());
        }

        @Override
        public void deleteAllById(List<String> ids) {
          ids.forEach(PRODUCTS::remove);
        }
      };

  @UI("/docs-products")
  public static class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return PRODUCT_STORE;
    }
  }

  // ── java-user-manual/advanced/rules.md ─────────────────────────────────────────────────────

  public record Miembro(String nombre) {}

  public record Grupo(
      @EditableOnlyWhenCreating @NotEmpty String id,
      @NotEmpty String nombre,
      String status,
      boolean main,
      @Colspan(2) String email,
      @Colspan(2) List<Miembro> miembros)
      implements Identifiable {}

  /** What rules.md printed before: a typed-looking id with no way to type it. */
  public record GrupoAntes(@NotEmpty String id, @NotEmpty String nombre) implements Identifiable {}

  static <T extends Identifiable> CrudStore<T> keyedAsItComes(Map<String, T> db) {
    return new CrudStore<>() {
      @Override
      public Optional<T> findById(String id) {
        return Optional.ofNullable(db.get(id));
      }

      @Override
      public String save(T entity) {
        db.put(entity.id(), entity);
        return entity.id();
      }

      @Override
      public List<T> findAll() {
        return List.copyOf(db.values());
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ids.forEach(db::remove);
      }
    };
  }

  static final Map<String, Grupo> GRUPOS = new ConcurrentHashMap<>();
  static final Map<String, GrupoAntes> GRUPOS_ANTES = new HashMap<>();

  @UI("/docs-grupos")
  public static class Grupos extends AutoCrud<Grupo> {
    @Override
    public CrudStore<Grupo> store() {
      return keyedAsItComes(GRUPOS);
    }
  }

  @UI("/docs-grupos-antes")
  public static class GruposAntes extends AutoCrud<GrupoAntes> {
    @Override
    public CrudStore<GrupoAntes> store() {
      return keyedAsItComes(GRUPOS_ANTES);
    }
  }

  // ── java-user-manual/use-cases/nested-crud.md ──────────────────────────────────────────────

  public record Level2View(String name) {}

  public record Level1View(String id, String name, @Colspan(2) List<Level2View> level2)
      implements Identifiable {}

  public static class Level1ViewStore implements CrudStore<Level1View> {

    private final Map<String, Level1View> db = new ConcurrentHashMap<>();

    @Override
    public Optional<Level1View> findById(String id) {
      return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(Level1View entity) {
      // `id` is technical: a new record arrives without one and the store assigns it
      var record =
          entity.id() == null || entity.id().isBlank()
              ? new Level1View(UUID.randomUUID().toString(), entity.name(), entity.level2())
              : entity;
      db.put(record.id(), record);
      return record.id();
    }

    @Override
    public List<Level1View> findAll() {
      return List.copyOf(db.values());
    }

    @Override
    public void deleteAllById(List<String> ids) {
      ids.forEach(db::remove);
    }
  }

  @UI("/docs-nested")
  public static class NestedCrud extends AutoCrud<Level1View> {
    final Level1ViewStore repo;

    public NestedCrud(Level1ViewStore repo) {
      this.repo = repo;
    }

    @Override
    public CrudStore<Level1View> store() {
      return repo;
    }
  }

  // ── java-user-manual/build/entity-interfaces.md, "Who assigns the id" ──────────────────────

  public record Article(String id, String name, BigDecimal price, ProductStatus status)
      implements Identifiable {}

  public static class ArticleStore implements CrudStore<Article> {

    private final Map<String, Article> db = new ConcurrentHashMap<>();

    @Override
    public String save(Article entity) {
      var product =
          entity.id() == null || entity.id().isBlank()
              ? new Article(
                  UUID.randomUUID().toString(), entity.name(), entity.price(), entity.status())
              : entity;
      db.put(product.id(), product);
      return product.id();
    }

    @Override
    public Optional<Article> findById(String id) {
      return Optional.ofNullable(db.get(id));
    }

    @Override
    public List<Article> findAll() {
      return List.copyOf(db.values());
    }

    @Override
    public void deleteAllById(List<String> ids) {
      ids.forEach(db::remove);
    }
  }

  static final ArticleStore ARTICLES = new ArticleStore();

  @UI("/docs-articles")
  public static class Articles extends AutoCrud<Article> {
    @Override
    public CrudStore<Article> store() {
      return ARTICLES;
    }
  }

  // ── the harness ───────────────────────────────────────────────────────────────────────────

  static final UserStore USERS = new UserStore();
  static final Level1ViewStore LEVEL1 = new Level1ViewStore();
  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            // the guides' orchestrators are @Service beans built with their store injected
            List.of(USERS, LEVEL1, new UsersPage(USERS), new NestedCrud(LEVEL1)),
            UsersPage.class,
            ItemsCatalog.class,
            Products.class,
            Grupos.class,
            GruposAntes.class,
            NestedCrud.class,
            Articles.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(
      Class<?> crud, String base, String action, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(base + "/new")
            .consumedRoute(base)
            .serverSideType(crud.getName())
            .actionId(action)
            .initiatorComponentId("c1")
            .componentState(Map.of())
            .parameters(state == null ? Map.of() : Map.of("initiatorState", state))
            .build());
  }

  private static List<String> fieldIds(UIIncrementDto increment) {
    var ids = new ArrayList<String>();
    collect(JSON.valueToTree(increment), ids);
    return ids;
  }

  private static void collect(JsonNode node, List<String> out) {
    if (node.isObject() && "FormField".equals(node.path("type").asText())) {
      out.add(node.path("fieldId").asText());
    }
    node.forEach(child -> collect(child, out));
  }

  private static String text(UIIncrementDto increment) {
    return JSON.valueToTree(increment).toString();
  }

  /** New shows the form, and the create lands in the store with no refusal. */
  private static String creates(
      Class<?> crud, String base, Map<String, Object> state, boolean idInput) {
    var form = run(crud, base, "", null);
    if (idInput) assertThat(fieldIds(form)).contains("id");
    else assertThat(fieldIds(form)).doesNotContain("id");
    var answer = text(run(crud, base, "create", state));
    assertThat(answer)
        .doesNotContain("saved without an id")
        .doesNotContain("There are validation errors")
        .doesNotContain("already exists")
        .doesNotContain("Something went wrong");
    return answer;
  }

  @Test
  void usersCrudCreatesAUserTheStoreGivesAnId() {
    var before = USERS.findAll().size();
    creates(
        UsersPage.class,
        "/docs-users",
        Map.of("name", "Lucía", "email", "lucia@example.com", "roles", List.of("3")),
        false);
    assertThat(USERS.findAll()).hasSize(before + 1);
    assertThat(USERS.findAll())
        .anySatisfy(
            u -> {
              assertThat(u.name()).isEqualTo("Lucía");
              assertThat(u.id()).isNotBlank();
            });
  }

  @Test
  void crudStoreItemsCreatesAnItemTheStoreGivesAnId() {
    var before = new ItemStore().findAll().size();
    creates(ItemsCatalog.class, "/docs-items", Map.of("name", "Widget C", "price", 5.5), false);
    assertThat(new ItemStore().findAll()).hasSize(before + 1);
    assertThat(new ItemStore().findAll()).allSatisfy(i -> assertThat(i.getId()).isNotBlank());
  }

  @Test
  void theQuickstartProductTakesTheIdTheUserTypes() {
    creates(
        Products.class,
        "/docs-products",
        Map.of("id", "P-100", "name", "Tamper", "price", 19.0, "status", "Available"),
        true);
    assertThat(PRODUCTS).containsKey("P-100");
  }

  @Test
  void theRulesGroupTakesTheIdTheUserTypes() {
    creates(
        Grupos.class, "/docs-grupos", Map.of("id", "g1", "nombre", "Admins", "main", true), true);
    assertThat(GRUPOS).containsKey("g1");
  }

  @Test
  void whatTheRulesPagePrintedBeforeWasRefused() {
    // the pin of the defect the docs fix: a @NotEmpty id the form never shows, a store keyed by it
    // —
    // the create is refused (the record lands under a null key, but the user is told)
    var form = run(GruposAntes.class, "/docs-grupos-antes", "", null);
    assertThat(fieldIds(form)).doesNotContain("id");
    var answer =
        text(run(GruposAntes.class, "/docs-grupos-antes", "create", Map.of("nombre", "x")));
    assertThat(answer).contains("saved without an id");
    assertThat(GRUPOS_ANTES.keySet()).allSatisfy(k -> assertThat(k).isNull());
  }

  @Test
  void theNestedCrudCreatesALevel1TheStoreGivesAnId() {
    creates(NestedCrud.class, "/docs-nested", Map.of("name", "Top"), false);
    assertThat(LEVEL1.findAll()).hasSize(1);
    assertThat(LEVEL1.findAll().get(0).id()).isNotBlank();
  }

  @Test
  void theWhoAssignsTheIdStoreCreatesARecord() {
    creates(
        Articles.class,
        "/docs-articles",
        Map.of("name", "Kettle", "price", 59, "status", "Available"),
        false);
    assertThat(ARTICLES.findAll()).hasSize(1);
  }
}
