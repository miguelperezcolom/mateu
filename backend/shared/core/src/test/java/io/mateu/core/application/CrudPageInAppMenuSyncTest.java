package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudFormState;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The answer to a button of a crud's routed record page — an editor's {@code @Button} on the edit /
 * creation form, a {@code @ViewToolbarButton} on the record's view — reaches THAT page however the
 * crud is hosted.
 *
 * <p>Those buttons bubble to an ancestor, and the request names the ancestor, not the page. The
 * page id used to be derived from it ({@code "ux_" + initiator − "_app" + "_cs_edit"}), which only
 * holds when the crud is its app's home (its own mediator sends the action). As a MENU ENTRY of
 * another app the action is sent by the app ({@code ux_root_…_App_app}) while the page is named
 * after the app's content slot at route time ({@code ux__intranet_docs_…DocsCrud_edit}): the answer
 * — right values, right message — targeted {@code ux_ux_root_…_App_cs_edit}, which is nothing, and
 * the form never showed it. The page now carries its own id in its state, which every one of its
 * bubbled actions sends back.
 */
class CrudPageInAppMenuSyncTest {

  public static class Doc implements Identifiable {
    String id;
    String body;

    // computed from the values: only a re-render of the page shows its new value
    Callable<Component> preview = () -> new Text("Preview: " + body);

    public Doc() {}

    Doc(String id, String body) {
      this.id = id;
      this.body = body;
    }

    @Override
    public String id() {
      return id;
    }

    @Button
    @Action
    public Object insertMedium() {
      body = body + " [[media:m1]]";
      return List.of(this, Message.success("Inserted"));
    }

    @Button
    @Action
    public Object nothingChanges() {
      return this;
    }

    @ViewToolbarButton
    public Message archive(Doc doc) {
      STORE.put(doc.id, doc.body + " (archived)");
      return Message.success("Archived");
    }
  }

  public record DocRow(String id, String body) {}

  static final Map<String, String> STORE = new ConcurrentHashMap<>();

  public static class DocsCrud extends Crud<Doc, Doc, Doc, Object, DocRow, String> {
    @Override
    public ListingData<DocRow> search(SearchRequest request, HttpRequest httpRequest) {
      var rows = List.of(new DocRow("d1", STORE.get("d1")));
      return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
    }

    @Override
    public Doc view(String id, HttpRequest httpRequest) {
      return new Doc(id, STORE.get(id));
    }

    @Override
    public Doc edit(String id, HttpRequest httpRequest) {
      return new Doc(id, STORE.get(id));
    }

    @Override
    public Doc creationForm(HttpRequest httpRequest) {
      return new Doc(null, "");
    }

    @Override
    public String create(HttpRequest httpRequest) {
      return save(httpRequest);
    }

    @Override
    public String save(HttpRequest httpRequest) {
      var form = CrudFormState.of(httpRequest);
      SAVED.clear();
      SAVED.putAll(form);
      STORE.put((String) form.get("id"), (String) form.get("body"));
      return (String) form.get("id");
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}
  }

  static final Map<String, Object> SAVED = new ConcurrentHashMap<>();

  /** An app with a menu, one of whose entries is the crud — not the app's home. */
  @SuppressWarnings("unused")
  @UI("/intranet")
  @Title("Intranet")
  public static class IntranetApp {
    @Menu DocsCrud docs;
  }

  /** The crud as its app's home: its own mediator sends its pages' actions. */
  @UI("/docs")
  @Title("Docs")
  public static class DocsHomeCrud extends DocsCrud {}

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(IntranetApp.class, DocsHomeCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    STORE.clear();
    STORE.put("d1", "Hello");
    SAVED.clear();
  }

  // the ids the Vaadin shell gives them (appRenderer.contentUxId: route + type at route time)
  static final String CONTENT_UX =
      "ux__intranet_docs_" + DocsCrud.class.getName().replace('.', '_');
  static final String APP = "ux_root_" + IntranetApp.class.getName().replace('.', '_') + "_app";

  /** The app's content slot loading a record page of the crud the menu entry opened. */
  private static UIIncrementDto loadInApp(String subRoute) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/intranet/docs" + subRoute)
            .consumedRoute("/intranet/docs")
            .serverSideType(DocsCrud.class.getName())
            .actionId("")
            .initiatorComponentId(CONTENT_UX)
            .build());
  }

  /** The page's button, bubbled up past the page to the app, which sends it. */
  private static UIIncrementDto pressInApp(
      String subRoute, String actionId, Map<String, Object> pageState) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/intranet/docs" + subRoute)
            .consumedRoute("/intranet")
            .serverSideType(DocsCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId(APP)
            .componentState(pageState)
            .parameters(Map.of("initiatorState", pageState))
            .build());
  }

  static ServerSideComponentDto routedPage(UIIncrementDto increment, String suffix) {
    var found = new ArrayList<ServerSideComponentDto>();
    increment.fragments().forEach(f -> collect(f.component(), found));
    return found.stream()
        .filter(c -> c.id() != null && c.id().endsWith(suffix))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no page *" + suffix + " in " + increment));
  }

  private static void collect(ComponentDto component, List<ServerSideComponentDto> found) {
    if (component instanceof ServerSideComponentDto server) {
      found.add(server);
      server.children().forEach(child -> collect(child, found));
    }
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      client.children().forEach(child -> collect(child, found));
    }
  }

  @SuppressWarnings("unchecked")
  static Map<String, Object> editedState(ServerSideComponentDto page, String body) {
    var state = new HashMap<>((Map<String, Object>) page.initialData());
    state.put("body", body);
    return state;
  }

  static Optional<UIFragmentDto> fragmentFor(UIIncrementDto increment, String targetId) {
    return increment.fragments().stream()
        .filter(f -> targetId.equals(f.targetComponentId()))
        .findFirst();
  }

  @Test
  void anEditorButtonOfACrudInAnAppMenuUpdatesTheEditPageItCameFrom() {
    var page = routedPage(loadInApp("/d1/edit"), "_edit");
    assertThat(page.id()).isEqualTo(CONTENT_UX + "_edit");

    var increment =
        pressInApp("/d1/edit", "action-on-editor-insertMedium", editedState(page, "Edited"));

    var fragment =
        fragmentFor(increment, page.id())
            .orElseThrow(() -> new AssertionError("nothing aimed at " + page.id() + increment));
    assertThat(((Map<?, ?>) fragment.state()).get("body")).isEqualTo("Edited [[media:m1]]");
    assertThat(increment.messages().toString()).contains("Inserted");
    assertThat(increment.fragments())
        .as("nothing aimed at an id derived from the app that sent the action")
        .noneMatch(f -> String.valueOf(f.targetComponentId()).contains("_cs_edit"));
    // nothing navigates away, nothing saved yet
    assertThat(increment.toString()).doesNotContain("PushStateToHistory");
    assertThat(STORE.get("d1")).isEqualTo("Hello");
  }

  @Test
  void thePageIsReRenderedInPlaceSoWhatTheEditorComputesFollowsTheValues() {
    var page = routedPage(loadInApp("/d1/edit"), "_edit");
    var increment =
        pressInApp("/d1/edit", "action-on-editor-insertMedium", editedState(page, "Edited"));
    var fragment = fragmentFor(increment, page.id()).orElseThrow();
    var rerendered = (ServerSideComponentDto) fragment.component();
    // the same page: same id and type (the client re-renders it in place, state merged), still the
    // edit form with its Cancel/Save and the editor's buttons, and its route kept
    assertThat(rerendered.id()).isEqualTo(page.id());
    assertThat(rerendered.serverSideType()).isEqualTo(page.serverSideType());
    assertThat(rerendered.route()).isEqualTo(page.route());
    assertThat(rerendered.confirmOnNavigationIfDirty()).isTrue();
    assertThat(rerendered.toString())
        .contains("actionId=save")
        .contains("actionId=action-on-editor-insertMedium")
        .contains("Preview: Edited [[media:m1]]");
    // the form holds values nobody saved yet: leaving it asks first
    assertThat(increment.commands())
        .anySatisfy(c -> assertThat(c.type()).isEqualTo(UICommandTypeDto.MarkAsDirty));
  }

  @Test
  void aButtonThatChangesNothingDoesNotMarkTheFormDirty() {
    var page = routedPage(loadInApp("/d1/edit"), "_edit");
    var increment =
        pressInApp("/d1/edit", "action-on-editor-nothingChanges", editedState(page, "Hello"));
    assertThat(fragmentFor(increment, page.id())).isPresent();
    assertThat(increment.commands())
        .noneSatisfy(c -> assertThat(c.type()).isEqualTo(UICommandTypeDto.MarkAsDirty));
  }

  @Test
  void aSecondPressStillFindsThePage() {
    var page = routedPage(loadInApp("/d1/edit"), "_edit");
    var first =
        pressInApp("/d1/edit", "action-on-editor-insertMedium", editedState(page, "Edited"));
    // the client merges the answer's state into the page's: the page still says where it is
    @SuppressWarnings("unchecked")
    var merged = new HashMap<>((Map<String, Object>) page.initialData());
    merged.putAll((Map<String, Object>) fragmentFor(first, page.id()).orElseThrow().state());
    var second = pressInApp("/d1/edit", "action-on-editor-insertMedium", merged);
    assertThat(fragmentFor(second, page.id()).orElseThrow().state().toString())
        .contains("Edited [[media:m1]] [[media:m1]]");
  }

  @Test
  void theCreationFormToo() {
    var page = routedPage(loadInApp("/new"), "_new");
    assertThat(page.id()).isEqualTo(CONTENT_UX + "_new");
    var state = editedState(page, "Draft");
    state.put("id", "d2");
    var increment = pressInApp("/new", "action-on-creation-form-insertMedium", state);
    assertThat(fragmentFor(increment, page.id()).orElseThrow().state().toString())
        .contains("Draft [[media:m1]]");
  }

  @Test
  void aViewToolbarButtonOfACrudInAnAppMenuUpdatesTheViewPageItCameFrom() {
    var page = routedPage(loadInApp("/d1"), "_view");
    assertThat(page.id()).isEqualTo(CONTENT_UX + "_view");
    @SuppressWarnings("unchecked")
    var state = new HashMap<>((Map<String, Object>) page.initialData());
    var increment = pressInApp("/d1", "action-on-view-archive", state);
    // the record, reloaded, lands on the view page (the crud's own routing state goes there too)
    assertThat(increment.fragments())
        .filteredOn(f -> page.id().equals(f.targetComponentId()))
        .anySatisfy(f -> assertThat(String.valueOf(f.state())).contains("Hello (archived)"));
    assertThat(increment.messages().toString()).contains("Archived");
  }

  @Test
  void thePagesWhereaboutsAreNotOneOfTheFormsValues() {
    var page = routedPage(loadInApp("/d1/edit"), "_edit");
    pressInApp("/d1/edit", "save", editedState(page, "Saved"));
    assertThat(STORE.get("d1")).isEqualTo("Saved");
    assertThat(SAVED).containsOnlyKeys("id", "body");
  }

  @Test
  void asTheAppsHomeTheAnswerReachesThePageToo() {
    // the shape #1005 covered: the crud's own mediator (its AppShell's content slot) loads the
    // page and sends its actions
    var load =
        mateu.run(
            RunActionRqDto.builder()
                .route("/docs/d1/edit")
                .consumedRoute("/docs")
                .serverSideType(DocsHomeCrud.class.getName())
                .actionId("")
                .initiatorComponentId("ux_c1_cs")
                .build());
    var page = routedPage(load, "_edit");
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/d1/edit")
                .consumedRoute("_empty")
                .serverSideType(DocsHomeCrud.class.getName())
                .actionId("action-on-editor-insertMedium")
                .initiatorComponentId("c1_app")
                .componentState(Map.of("_route", "/d1/edit", "_componentRoute", "/docs"))
                .parameters(Map.of("initiatorState", editedState(page, "Edited")))
                .build());
    assertThat(page.id()).isEqualTo("ux_c1_cs_edit");
    assertThat(fragmentFor(increment, "ux_c1_cs_edit").orElseThrow().state().toString())
        .contains("Edited [[media:m1]]");
  }
}
