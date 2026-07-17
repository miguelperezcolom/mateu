package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.DialogDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.CrudRepository;
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
    public CrudRepository<Article> repository() {
      return new CrudRepository<>() {
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

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ArticlesCrud.class);
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
    assertThat(dialog.headerTitle()).isEqualTo("Modificado por otro usuario");
    var stored = ARTICLES.get(0);
    assertThat(stored.name).isEqualTo("Their change");
    assertThat(stored.version).isEqualTo(2);
  }

  @Test
  void overwriteFromTheDialogWinsExplicitlyAndKeepsMovingTheVersionForward() {
    save(articleState("Their change", 1), null);
    // the dialog's Sobrescribir button re-dispatches save with _forceOverwrite
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
}
