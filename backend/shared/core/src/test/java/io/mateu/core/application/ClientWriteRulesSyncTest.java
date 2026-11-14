package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Editable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * What a client may WRITE, on every path that builds an object from its state — one rule ({@code
 * FieldAccess.mayWrite}) for a setter, a record constructor, a nested form, a crud save, an inline
 * row edit, an editable view and a capability listing (GA review S3 and java-core #1, #2, #3, #7).
 */
class ClientWriteRulesSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  // ── nested forms (S3) ───────────────────────────────────────────────────────────────────

  public static class Pay {
    @ReadOnlyUnless(roles = "manager")
    public double salary = 100;

    @EyesOnly(roles = "manager")
    public String secretNote = "top";

    public String note = "n";
  }

  @UI("/cw-nested")
  public static class Employee {
    public String name = "x";

    @ReadOnlyUnless(roles = "manager")
    public double bonus = 1;

    @Inline public Pay pay = new Pay();
    public Pay other = new Pay();
    public List<Pay> history = new ArrayList<>(List.of(new Pay()));

    @Action
    public Message save() {
      return new Message(
          "bonus="
              + bonus
              + " pay.salary="
              + pay.salary
              + " pay.secret="
              + pay.secretNote
              + " pay.note="
              + pay.note
              + " other.salary="
              + other.salary
              + " other.secret="
              + other.secretNote
              + " history.salary="
              + history.get(0).salary);
    }
  }

  // ── records (java-core #3) ──────────────────────────────────────────────────────────────

  @UI("/cw-record")
  public record RecForm(
      String name,
      @ReadOnlyUnless(roles = "manager") double discount,
      @EyesOnly(roles = "manager") String secret) {
    @Action
    public Message save() {
      return new Message("rec " + name + "/" + discount + "/" + secret);
    }
  }

  // ── crud (java-core #1, #2) ─────────────────────────────────────────────────────────────

  public static class Product implements Identifiable {
    @EditableOnlyWhenCreating public String id;
    public String name;
    @ReadOnly public double price;

    @EyesOnly(roles = "manager")
    public String internal;

    @ReadOnlyUnless(roles = "manager")
    public String category;

    @HiddenInList public String notes;

    /** What the user never edits (GA round 2, N5). */
    @io.mateu.uidl.annotations.Hidden public String tenant;

    /** What never travels (GA round 2, N4, N5). */
    @com.fasterxml.jackson.annotation.JsonIgnore public String passwordHash;

    public Product() {}

    Product(String id, String name, double price, String internal, String category) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.internal = internal;
      this.category = category;
      this.notes = "stored notes";
      this.tenant = "acme";
      this.passwordHash = "HASH";
    }

    @Override
    public String id() {
      return id;
    }
  }

  public record Note(String id, String title, @EyesOnly(roles = "manager") String internal)
      implements Identifiable {}

  static final List<Product> PRODUCTS = new ArrayList<>();
  static final List<Note> NOTES = new ArrayList<>();

  static <T extends Identifiable> CrudStore<T> storeOf(List<T> rows) {
    return new CrudStore<>() {
      @Override
      public Optional<T> findById(String id) {
        return rows.stream().filter(p -> p.id().equals(id)).findFirst();
      }

      @Override
      public String save(T entity) {
        rows.removeIf(p -> p.id().equals(entity.id()));
        rows.add(entity);
        return entity.id();
      }

      @Override
      public List<T> findAll() {
        return rows;
      }

      @Override
      public void deleteAllById(List<String> ids) {
        rows.removeIf(p -> ids.contains(p.id()));
      }
    };
  }

  @UI("/cw-products")
  @Title("Products")
  @InlineEditing
  public static class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return storeOf(PRODUCTS);
    }
  }

  @UI("/cw-notes")
  @Title("Notes")
  public static class Notes extends AutoCrud<Note> {
    @Override
    public CrudStore<Note> store() {
      return storeOf(NOTES);
    }
  }

  // ── editable view (java-core #7) ────────────────────────────────────────────────────────

  public static class Profile {
    public String id = "me";
    public String name = "Ada";
    @ReadOnly public String plan = "basic";

    @EyesOnly(roles = "manager")
    public String rating = "A+";
  }

  static final List<Profile> PERSISTED = new ArrayList<>();

  @UI("/cw-profile")
  @Title("Profile")
  public static class ProfileView extends AutoEditableView<Profile> {
    @Override
    public Profile load(HttpRequest httpRequest) {
      return new Profile();
    }

    @Override
    public void persist(Profile entity, HttpRequest httpRequest) {
      PERSISTED.add(entity);
    }
  }

  // ── capability listing ──────────────────────────────────────────────────────────────────

  @UI("/cw-cap")
  public static class CapProducts implements Listing<Product>, Editable<Product, String> {
    static volatile Product saved;

    @Override
    public ListingData<Product> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(PRODUCTS);
    }

    @Override
    public Product edit(String id, HttpRequest httpRequest) {
      return PRODUCTS.stream().filter(p -> p.id.equals(id)).findFirst().orElseThrow();
    }

    @Override
    public String save(HttpRequest httpRequest) {
      saved = httpRequest.getComponentState(Product.class);
      return saved.id;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            Employee.class,
            RecForm.class,
            Products.class,
            Notes.class,
            ProfileView.class,
            CapProducts.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    PRODUCTS.clear();
    PRODUCTS.add(new Product("P-001", "Lamp", 249.0, "MANAGER ONLY", "lighting"));
    NOTES.clear();
    NOTES.add(new Note("1", "hello", "MANAGER ONLY"));
    PERSISTED.clear();
    CapProducts.saved = null;
  }

  private static UIIncrementDto run(
      String route,
      String consumed,
      Class<?> type,
      String action,
      Map<String, Object> state,
      Map<String, Object> parameters,
      String... roles) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(type.getName())
            .actionId(action)
            .initiatorComponentId("c1")
            .componentState(state)
            .parameters(parameters == null ? Map.of() : parameters)
            .build(),
        roles.length == 0 ? Map.of() : TestIdentities.headersWithRoles(roles));
  }

  private static String text(UIIncrementDto increment) {
    return increment.messages().isEmpty() ? "" : increment.messages().get(0).text();
  }

  private static Product product(String id) {
    return PRODUCTS.stream().filter(p -> p.id.equals(id)).findFirst().orElse(null);
  }

  // ── S3 ──────────────────────────────────────────────────────────────────────────────────

  private static Map<String, Object> forgedEmployee() {
    var state = new LinkedHashMap<String, Object>();
    state.put("bonus", 999);
    state.put("pay", Map.of("salary", 999, "secretNote", "pwned", "note", "ok"));
    state.put("other", Map.of("salary", 999, "secretNote", "pwned"));
    state.put("history", List.of(Map.of("salary", 999, "secretNote", "pwned")));
    state.put("pay-salary", 777);
    return state;
  }

  @Test
  void aNestedFormsProtectedFieldsAreNotWritable() {
    var out = text(run("/cw-nested", "/cw-nested", Employee.class, "save", forgedEmployee(), null));
    assertThat(out)
        .isEqualTo(
            "bonus=1.0 pay.salary=100.0 pay.secret=top pay.note=ok other.salary=100.0"
                + " other.secret=top history.salary=100.0");
    // the caller they are for writes them
    assertThat(
            text(
                run(
                    "/cw-nested",
                    "/cw-nested",
                    Employee.class,
                    "save",
                    forgedEmployee(),
                    null,
                    "manager")))
        .contains("bonus=999.0", "pay.salary=777.0", "pay.secret=pwned", "other.secret=pwned");
  }

  @Test
  void aNestedFormsHiddenFieldIsNotSent() {
    var load =
        JSON.valueToTree(run("/cw-nested", "/cw-nested", Employee.class, "", Map.of(), null));
    assertThat(load.toString()).doesNotContain("\"top\"");
    var managerLoad =
        JSON.valueToTree(
            run("/cw-nested", "/cw-nested", Employee.class, "", Map.of(), null, "manager"));
    assertThat(managerLoad.toString()).contains("\"top\"");
  }

  // ── java-core #3 ────────────────────────────────────────────────────────────────────────

  @Test
  void aRecordViewModelIsHeldToTheSameRule() {
    var state = Map.<String, Object>of("name", "x", "discount", 99.0, "secret", "forged");
    assertThat(text(run("/cw-record", "/cw-record", RecForm.class, "save", state, null)))
        .isEqualTo("rec x/0.0/null");
    assertThat(text(run("/cw-record", "/cw-record", RecForm.class, "save", state, null, "manager")))
        .isEqualTo("rec x/99.0/forged");
  }

  // ── java-core #1 ────────────────────────────────────────────────────────────────────────

  private static Map<String, Object> forgedProduct() {
    var state = new LinkedHashMap<String, Object>();
    state.put("id", "P-001");
    state.put("name", "Lamp 2");
    state.put("price", 1.0);
    state.put("internal", "forged");
    state.put("category", "forged");
    return state;
  }

  @Test
  void aSaveAtARouteNamingNoRecordIsRefused() {
    var answer =
        run(
            "/cw-products/does-not-exist/edit",
            "/cw-products",
            Products.class,
            "save",
            forgedProduct(),
            null);
    assertThat(text(answer)).contains("no longer exists");
    var stored = product("P-001");
    assertThat(stored.price).isEqualTo(249.0);
    assertThat(stored.name).isEqualTo("Lamp");
  }

  @Test
  void aSaveSavesTheRecordItsRouteNamesWhateverIdItPosts() {
    var state = forgedProduct();
    state.put("id", "P-002");
    run("/cw-products/P-001/edit", "/cw-products", Products.class, "save", state, null);
    assertThat(product("P-002")).isNull();
    assertThat(product("P-001").name).isEqualTo("Lamp 2");
    assertThat(product("P-001").price).isEqualTo(249.0);
  }

  // ── java-core #2 ────────────────────────────────────────────────────────────────────────

  @Test
  void anEditByACallerWhoCannotSeeAFieldKeepsItsStoredValue() {
    run("/cw-products/P-001/edit", "/cw-products", Products.class, "save", forgedProduct(), null);
    var stored = product("P-001");
    assertThat(stored.name).isEqualTo("Lamp 2");
    assertThat(stored.internal).isEqualTo("MANAGER ONLY");
    assertThat(stored.category).isEqualTo("lighting");
    assertThat(stored.notes).isEqualTo("stored notes");
    // with a record entity too
    run(
        "/cw-notes/1/edit",
        "/cw-notes",
        Notes.class,
        "save",
        Map.of("id", "1", "title", "hello 2", "internal", "forged"),
        null);
    assertThat(NOTES.get(0)).isEqualTo(new Note("1", "hello 2", "MANAGER ONLY"));
    // the manager writes them
    run(
        "/cw-products/P-001/edit",
        "/cw-products",
        Products.class,
        "save",
        forgedProduct(),
        null,
        "manager");
    assertThat(product("P-001").internal).isEqualTo("forged");
    assertThat(product("P-001").category).isEqualTo("forged");
  }

  @Test
  void anInlineRowEditWritesOnlyTheCellsOfTheGrid() {
    var row = forgedProduct();
    row.put("notes", "forged notes");
    run(
        "/cw-products",
        "/cw-products",
        Products.class,
        "update-row",
        Map.of(),
        Map.of("_editedRow", row));
    var stored = product("P-001");
    assertThat(stored.name).isEqualTo("Lamp 2");
    assertThat(stored.notes).isEqualTo("stored notes");
    assertThat(stored.internal).isEqualTo("MANAGER ONLY");
    assertThat(stored.category).isEqualTo("lighting");
    assertThat(stored.price).isEqualTo(249.0);
  }

  // ── java-core #7 ────────────────────────────────────────────────────────────────────────

  @Test
  void anEditableViewSavesOnlyWhatItsEditorLetsTheUserWrite() {
    run(
        "/cw-profile/edit",
        "/cw-profile",
        ProfileView.class,
        "save",
        Map.of("id", "someone-else", "name", "Eva", "plan", "premium", "rating", "forged"),
        null);
    assertThat(PERSISTED).hasSize(1);
    var saved = PERSISTED.get(0);
    assertThat(saved.name).isEqualTo("Eva");
    assertThat(saved.id).isEqualTo("me");
    assertThat(saved.plan).isEqualTo("basic");
    assertThat(saved.rating).isEqualTo("A+");
  }

  // ── capability listing ──────────────────────────────────────────────────────────────────

  @Test
  void aCapabilityListingSaveStartsFromTheRecordItEdits() {
    run("/cw-cap/P-001/edit", "/cw-cap", CapProducts.class, "save", forgedProduct(), null);
    var saved = CapProducts.saved;
    assertThat(saved).isNotNull();
    assertThat(saved.name).isEqualTo("Lamp 2");
    assertThat(saved.price).isEqualTo(249.0);
    assertThat(saved.internal).isEqualTo("MANAGER ONLY");
    assertThat(saved.category).isEqualTo("lighting");
  }

  // ── GA round 2: N3, N4, N5 ──────────────────────────────────────────────────────────────

  @Test
  void aCreateNamingAStoredIdIsRefusedAndTheRecordIsLeftAlone() {
    var answer =
        run(
            "/cw-products/new",
            "/cw-products",
            Products.class,
            "create",
            Map.of(),
            Map.of("initiatorState", Map.of("id", "P-001", "name", "dup")));
    assertThat(text(answer)).contains("already exists");
    var stored = product("P-001");
    assertThat(stored.name).isEqualTo("Lamp");
    assertThat(stored.internal).isEqualTo("MANAGER ONLY");
    assertThat(stored.price).isEqualTo(249.0);
    assertThat(stored.tenant).isEqualTo("acme");
    assertThat(PRODUCTS).hasSize(1);
  }

  @Test
  void anEditKeepsTheFieldsJacksonDoesNotSerialise() {
    run("/cw-products/P-001/edit", "/cw-products", Products.class, "save", forgedProduct(), null);
    var stored = product("P-001");
    assertThat(stored.name).isEqualTo("Lamp 2");
    assertThat(stored.passwordHash).isEqualTo("HASH");
    assertThat(stored.tenant).isEqualTo("acme");
  }

  @Test
  void aForgedSaveCannotWriteAHiddenOrANeverSentField() {
    var state = forgedProduct();
    state.put("tenant", "other");
    state.put("passwordHash", "X");
    run("/cw-products/P-001/edit", "/cw-products", Products.class, "save", state, null);
    var stored = product("P-001");
    assertThat(stored.name).isEqualTo("Lamp 2");
    assertThat(stored.tenant).isEqualTo("acme");
    assertThat(stored.passwordHash).isEqualTo("HASH");
    // nor through a capability listing's save
    run("/cw-cap/P-001/edit", "/cw-cap", CapProducts.class, "save", state, null);
    assertThat(CapProducts.saved.tenant).isEqualTo("acme");
    assertThat(CapProducts.saved.passwordHash).isNotEqualTo("X");
  }
}
