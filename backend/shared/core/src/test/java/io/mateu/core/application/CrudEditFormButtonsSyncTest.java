package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudFormState;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The editor's own {@code @Button}s on a crud's edit / creation form.
 *
 * <p>They are actions that only make sense while editing — insert a medium into the text, translate
 * it, refresh a preview —: they change the form's values, and the user then saves. The form used to
 * render only Cancel/Save, so an editor could not offer them at all. Now they render under the form
 * and, like save, bubble to the crud with the form's values: the method runs on the editor rebuilt
 * from them and the form takes its new values IN PLACE — still in edit mode, Save still there and
 * still saving what the action produced.
 */
class CrudEditFormButtonsSyncTest {

  public static class Doc implements Identifiable, VisibilitySupplier {
    String id;
    String body;

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
      return this;
    }

    @Button
    @Action
    public Object translate() {
      body = body + " (translated)";
      return List.of(this, Message.success("Translated: review it and save"));
    }

    @Button
    @Action
    public Object secret() {
      return this;
    }

    @Override
    public boolean isHidden(String fieldId, HttpRequest httpRequest) {
      return "secret".equals(fieldId);
    }
  }

  public record DocRow(String id, String body) {}

  static final Map<String, String> STORE = new ConcurrentHashMap<>();

  @UI("/docs")
  @Title("Docs")
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
      STORE.put((String) form.get("id"), (String) form.get("body"));
      return (String) form.get("id");
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}
  }

  public static class DocsInDrawerCrud extends DocsCrud {
    @Override
    public boolean editInDrawer() {
      return true;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DocsCrud.class, DocsInDrawerCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    STORE.clear();
    STORE.put("d1", "Hello");
  }

  private UIIncrementDto load(String route) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/docs")
            .serverSideType(DocsCrud.class.getName())
            .actionId("")
            .initiatorComponentId("c1_app")
            .build());
  }

  private static PageDto page(UIIncrementDto increment) {
    return increment.fragments().stream()
        .flatMap(f -> FieldKindsSyncTest.collect(f.component(), PageDto.class).stream())
        .findFirst()
        .orElseThrow();
  }

  private static List<String> actionIds(List<?> triggers) {
    return triggers.stream()
        .filter(ButtonDto.class::isInstance)
        .map(ButtonDto.class::cast)
        .map(ButtonDto::actionId)
        .toList();
  }

  /** What the browser sends: the form bubbles to the crud, its values as initiatorState. */
  private UIIncrementDto press(Class<?> crud, String route, String actionId, String body) {
    Map<String, Object> form = new HashMap<>();
    form.put("id", "d1");
    form.put("body", body);
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("_empty")
            .serverSideType(crud.getName())
            .actionId(actionId)
            .initiatorComponentId("_ux_app")
            .componentState(
                Map.of(
                    "_route",
                    "/d1/edit",
                    "_componentRoute",
                    "/docs",
                    "crud_selected_items",
                    List.of()))
            .parameters(Map.of("initiatorState", form))
            .build());
  }

  @Test
  void theEditFormRendersTheEditorsButtonsUnderTheFormAndKeepsCancelSaveInTheToolbar() {
    var increment = load("/docs/d1/edit");
    var page = page(increment);
    assertThat(actionIds(page.toolbar())).containsExactly("cancel-edit", "save");
    assertThat(actionIds(page.buttons()))
        .containsExactlyInAnyOrder("action-on-editor-insertMedium", "action-on-editor-translate")
        .as("hidden by the editor's VisibilitySupplier")
        .doesNotContain("action-on-editor-secret");
    // they bubble to the crud with the form's values, like save
    assertThat(increment.toString())
        .containsPattern("ActionDto\\[id=action-on-editor-insertMedium,[^\\]]*bubble=true");
  }

  @Test
  void theCrudClaimsThemWhenTheyBubbleUp() {
    // the browser hands a bubbling action to the first ancestor declaring it: the crud's mediator
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/docs")
                .consumedRoute("")
                .actionId("")
                .initiatorComponentId("c1")
                .build());
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.actions())
        .extracting(io.mateu.dtos.ActionDto::id)
        .contains("action-on-editor-*", "action-on-creation-form-*");
  }

  @Test
  void theCreationFormRendersThemToo() {
    var page = page(load("/docs/new"));
    assertThat(actionIds(page.toolbar())).containsExactly("cancel-new", "create");
    assertThat(actionIds(page.buttons()))
        .containsExactlyInAnyOrder(
            "action-on-creation-form-insertMedium", "action-on-creation-form-translate");
  }

  @Test
  void pressingOneRunsTheEditorMethodOnTheFormsValuesAndUpdatesTheFormInPlace() {
    var increment = press(DocsCrud.class, "/d1/edit", "action-on-editor-insertMedium", "Edited");
    var fragment =
        increment.fragments().stream()
            .filter(f -> "ux__ux_cs_edit".equals(f.targetComponentId()))
            .findFirst()
            .orElseThrow();
    // only the values: the form — with its Cancel/Save — stays as it is
    assertThat(fragment.component()).isNull();
    assertThat(((Map<?, ?>) fragment.state()).get("body")).isEqualTo("Edited [[media:m1]]");
    // nothing navigates away from the edit form, and nothing was saved yet
    assertThat(increment.toString()).doesNotContain("PushStateToHistory");
    assertThat(STORE.get("d1")).isEqualTo("Hello");
  }

  @Test
  void theMessagesTheMethodReturnsWithTheFormAreShown() {
    var increment = press(DocsCrud.class, "/d1/edit", "action-on-editor-translate", "Hola");
    assertThat(increment.fragments())
        .map(UIFragmentDto::state)
        .anySatisfy(state -> assertThat(state.toString()).contains("Hola (translated)"));
    assertThat(increment.messages().toString()).contains("Translated: review it and save");
  }

  @Test
  void saveStillSavesWhatTheActionProduced() {
    var increment = press(DocsCrud.class, "/d1/edit", "action-on-editor-insertMedium", "Edited");
    var state =
        (Map<?, ?>)
            increment.fragments().stream()
                .filter(f -> "ux__ux_cs_edit".equals(f.targetComponentId()))
                .findFirst()
                .orElseThrow()
                .state();
    press(DocsCrud.class, "/d1/edit", "save", (String) state.get("body"));
    assertThat(STORE.get("d1")).isEqualTo("Edited [[media:m1]]");
  }

  @Test
  void anIdNamingNoButtonOfTheFormIsRefused() {
    // only the form's @Button members are reachable through the prefix — not any field or method
    assertThatThrownBy(() -> press(DocsCrud.class, "/d1/edit", "action-on-editor-id", "Edited"))
        .isInstanceOf(MateuForbiddenException.class);
    assertThatThrownBy(() -> press(DocsCrud.class, "/d1/edit", "action-on-editor-isHidden", "x"))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(STORE.get("d1")).isEqualTo("Hello");
  }

  @Test
  void inTheDrawerTheyGoBeforeCancelSaveAndTheDrawerIsRefreshedInPlace() {
    var increment =
        press(DocsInDrawerCrud.class, "/d1/edit", "action-on-editor-insertMedium", "Edited");
    var text = increment.toString();
    assertThat(text).contains("crud-edit-drawer").contains("Edited [[media:m1]]");
    var insert = text.indexOf("actionId=action-on-editor-insertMedium");
    var cancel = text.indexOf("actionId=cancel-edit");
    var save = text.indexOf("actionId=save,");
    assertThat(insert).isPositive().isLessThan(cancel);
    assertThat(cancel).isLessThan(save);
    assertThat(STORE.get("d1")).isEqualTo("Hello");
  }
}
