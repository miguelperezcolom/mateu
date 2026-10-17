package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.DialogDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Optimistic locking ({@code @Version}): saving over someone else's save is rejected with a
 * conflict dialog (reload / overwrite); a normal save bumps the version; the dialog's overwrite
 * button re-dispatches the save with {@code _forceOverwrite} and wins explicitly, adopting the
 * stored version before bumping so the stale one is never resurrected.
 */
class OptimisticLockSyncTest {

  public static class Article implements Identifiable {
    String id;
    String name;
    @Version long version;

    public Article() {}

    public Article(String id, String name, long version) {
      this.id = id;
      this.name = name;
      this.version = version;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Article> ARTICLES = new ArrayList<>();

  @UI("/locked-articles")
  @Title("Articles")
  public static class ArticlesCrud extends AutoCrud<Article> {
    @Override
    public CrudStore<Article> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Article> findById(String id) {
          return ARTICLES.stream().filter(article -> article.id().equals(id)).findFirst();
        }

        @Override
        public String save(Article entity) {
          ARTICLES.replaceAll(article -> article.id().equals(entity.id()) ? entity : article);
          return entity.id;
        }

        @Override
        public List<Article> findAll() {
          return ARTICLES;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          ARTICLES.removeIf(article -> selectedIds.contains(article.id()));
        }
      };
    }
  }

  @UI("/locked-articles-drawer")
  @Title("Articles")
  public static class ArticlesInDrawerCrud extends ArticlesCrud {
    @Override
    public boolean editInDrawer() {
      return true;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ArticlesCrud.class, ArticlesInDrawerCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    ARTICLES.clear();
    ARTICLES.add(new Article("1", "Original", 1));
  }

  private UIIncrementDto save(Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/locked-articles/1")
            .consumedRoute("/locked-articles")
            .serverSideType(ArticlesCrud.class.getName())
            .actionId("save")
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private static DialogDto findDialog(Object component) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof DialogDto dialog) {
        return dialog;
      }
      for (var child : client.children()) {
        var found = findDialog(child);
        if (found != null) {
          return found;
        }
      }
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      for (var child : server.children()) {
        var found = findDialog(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private static DialogDto findDialog(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      var found = findDialog(fragment.component());
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  private Map<String, Object> articleState(String name, long version) {
    var state = new HashMap<String, Object>();
    state.put("id", "1");
    state.put("name", name);
    state.put("version", version);
    return state;
  }

  @Test
  void aNormalSaveBumpsTheVersion() {
    var increment = save(articleState("Renamed", 1), null);
    assertThat(findDialog(increment)).isNull();
    var stored = ARTICLES.get(0);
    assertThat(stored.name).isEqualTo("Renamed");
    assertThat(stored.version).isEqualTo(2);
  }

  @Test
  void aStaleSaveIsRejectedWithTheConflictDialogAndNothingIsPersisted() {
    // someone else saved first: stored version moves to 2
    save(articleState("Their change", 1), null);
    // my editor still carries version 1 → conflict
    var increment = save(articleState("My change", 1), null);
    var dialog = findDialog(increment);
    assertThat(dialog).isNotNull();
    assertThat(dialog.headerTitle()).isEqualTo("Modified by another user");
    var stored = ARTICLES.get(0);
    assertThat(stored.name).isEqualTo("Their change");
    assertThat(stored.version).isEqualTo(2);
  }

  @Test
  void overwriteFromTheDialogWinsExplicitlyAndKeepsMovingTheVersionForward() {
    save(articleState("Their change", 1), null);
    // the dialog's Overwrite button re-dispatches save with _forceOverwrite
    var increment = save(articleState("My change", 1), Map.of("_forceOverwrite", true));
    assertThat(findDialog(increment)).isNull();
    var stored = ARTICLES.get(0);
    assertThat(stored.name).isEqualTo("My change");
    // adopted the stored version (2) then bumped: never back to a stale number
    assertThat(stored.version).isEqualTo(3);
  }

  @Test
  void entitiesWithoutAVersionFieldAreUntouchedByTheLock() {
    // the bulk fixture from BulkActionsSyncTest has no @Version — this suite just documents that
    // check/bump are no-ops without the field (covered by every other crud suite still passing)
    assertThat(
            io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.versionField(
                BulkActionsSyncTest.Invoice.class))
        .isEmpty();
  }

  private UIIncrementDto load(String route) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/locked-articles")
            .serverSideType(ArticlesCrud.class.getName())
            .actionId("")
            .initiatorComponentId("c1_app")
            .build());
  }

  @Test
  void theVersionRidesInTheEditorStateButIsNeverAnInput() {
    var increment = load("/locked-articles/1/edit");
    var fields =
        increment.fragments().stream()
            .flatMap(f -> FieldKindsSyncTest.collect(f.component(), FormFieldDto.class).stream())
            .map(FormFieldDto::fieldId)
            .toList();
    assertThat(fields).contains("name").doesNotContain("version");
    assertThat(increment.toString()).contains("version=1");
    // nor on the creation form
    var creation =
        load("/locked-articles/new").fragments().stream()
            .flatMap(f -> FieldKindsSyncTest.collect(f.component(), FormFieldDto.class).stream())
            .map(FormFieldDto::fieldId)
            .toList();
    assertThat(creation).contains("name").doesNotContain("version");
  }

  // ── what the BROWSER sends ──────────────────────────────────────────────────────────────────
  // The edit form bubbles its save up to the crud component: componentState is the CRUD PAGE's
  // state and the form travels as parameters.initiatorState. The conflict dialog is added to the
  // crud component, so its buttons dispatch from there — with the crud's state and only the
  // parameters the button itself carries. Before the fix the buttons carried no form state: no
  // id, no fields (Overwrite navigated to /null, or created a duplicate row in the drawer).

  private static final Map<String, Object> CRUD_PAGE_STATE =
      Map.of(
          "_route",
          "/1/edit",
          "_componentRoute",
          "/locked-articles",
          "crud_selected_items",
          List.of());

  private UIIncrementDto browserRun(
      Class<?> crud, String route, String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("_empty")
            .serverSideType(crud.getName())
            .actionId(actionId)
            .initiatorComponentId("_ux_app")
            .componentState(CRUD_PAGE_STATE)
            .parameters(parameters)
            .build());
  }

  private UIIncrementDto browserSave(Class<?> crud, String name, long version) {
    var form = articleState(name, version);
    return browserRun(crud, "/1/edit", "save", Map.of("initiatorState", form));
  }

  /** Presses a dialog button exactly as the browser does: its actionId + its own parameters. */
  @SuppressWarnings("unchecked")
  private UIIncrementDto press(Class<?> crud, DialogDto dialog, String label) {
    var buttons = new ArrayList<io.mateu.dtos.ButtonDto>();
    collectButtons(dialog.content(), buttons);
    var button = buttons.stream().filter(b -> label.equals(b.label())).findFirst().orElseThrow();
    return browserRun(
        crud, "/1/edit", button.actionId(), (Map<String, Object>) button.parameters());
  }

  private static void collectButtons(Object node, List<io.mateu.dtos.ButtonDto> out) {
    if (node instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof io.mateu.dtos.ButtonDto button) {
        out.add(button);
      }
      client.children().forEach(child -> collectButtons(child, out));
    }
  }

  private static long closes(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == io.mateu.dtos.UICommandTypeDto.CloseModal)
        .count();
  }

  private DialogDto browserConflict(Class<?> crud) {
    browserSave(crud, "Their change", 1);
    var dialog = findDialog(browserSave(crud, "My change", 1));
    assertThat(dialog).isNotNull();
    return dialog;
  }

  @Test
  void theDialogIsEnglishAndItsButtonsCarryTheEditForm() {
    var dialog = browserConflict(ArticlesCrud.class);
    assertThat(dialog.headerTitle()).isEqualTo("Modified by another user");
    var buttons = new ArrayList<io.mateu.dtos.ButtonDto>();
    collectButtons(dialog.content(), buttons);
    assertThat(buttons)
        .extracting(io.mateu.dtos.ButtonDto::label)
        .containsExactly("Reload", "Overwrite");
    assertThat(buttons)
        .allSatisfy(
            b ->
                assertThat(b.parameters().toString())
                    .contains("initiatorState")
                    .contains("My change"));
  }

  @Test
  void overwriteFromTheBrowserSavesMyEditAndClosesTheDialog() {
    var dialog = browserConflict(ArticlesCrud.class);
    var increment = press(ArticlesCrud.class, dialog, "Overwrite");
    assertThat(findDialog(increment)).isNull();
    assertThat(ARTICLES).hasSize(1);
    assertThat(ARTICLES.get(0).name).isEqualTo("My change");
    assertThat(ARTICLES.get(0).version).isEqualTo(3);
    assertThat(closes(increment)).as("the dialog closes").isEqualTo(1);
    assertThat(increment.toString()).doesNotContain("/null").contains("/locked-articles/1");
  }

  @Test
  void reloadFromTheBrowserShowsTheirsAndClosesTheDialog() {
    var dialog = browserConflict(ArticlesCrud.class);
    var increment = press(ArticlesCrud.class, dialog, "Reload");
    assertThat(closes(increment)).isEqualTo(1);
    assertThat(increment.toString()).doesNotContain("/null").contains("/locked-articles/1");
    assertThat(ARTICLES.get(0).name).isEqualTo("Their change");
  }

  @Test
  void overwriteInTheDrawerUpdatesTheRowInsteadOfAddingOne() {
    var dialog = browserConflict(ArticlesInDrawerCrud.class);
    var increment = press(ArticlesInDrawerCrud.class, dialog, "Overwrite");
    assertThat(ARTICLES).hasSize(1);
    assertThat(ARTICLES.get(0).name).isEqualTo("My change");
    // the dialog AND the drawer under it close (the second emits the saved event)
    assertThat(closes(increment)).isEqualTo(2);
  }

  @Test
  void reloadInTheDrawerRefreshesItWithTheirVersion() {
    var dialog = browserConflict(ArticlesInDrawerCrud.class);
    var increment = press(ArticlesInDrawerCrud.class, dialog, "Reload");
    assertThat(closes(increment)).as("only the dialog closes").isEqualTo(1);
    assertThat(increment.fragments())
        .anySatisfy(f -> assertThat(f.component().toString()).contains("Drawer"));
    assertThat(increment.toString()).contains("Their change").doesNotContain("My change");
  }
}
