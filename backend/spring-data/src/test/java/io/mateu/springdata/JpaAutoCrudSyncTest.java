package io.mateu.springdata;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.dtos.DialogDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.springdata.fixtures.Article;
import io.mateu.springdata.fixtures.Repositories.ArticleRepository;
import io.mateu.springdata.fixtures.TestJpaApp;
import io.mateu.springdata.testutil.MiniMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * An {@code AutoCrud} whose {@code store()} is {@code CrudStores.of(repository)}, driven through
 * the whole Mateu server side (route resolution → crud mediator → action handlers): the listing
 * search reaches the database, and a stale save over a JPA {@code @Version} opens Mateu's conflict
 * dialog — with the overwrite button winning explicitly.
 */
@SpringBootTest(classes = TestJpaApp.class)
class JpaAutoCrudSyncTest {

  static ArticleRepository repository;

  @UI("/articles")
  @Title("Articles")
  public static class ArticlesCrud extends AutoCrud<Article> {
    @Override
    public CrudStore<Article> store() {
      return CrudStores.of(repository);
    }
  }

  static MiniMateu mateu;

  @Autowired ArticleRepository articles;

  @BeforeAll
  static void boot() {
    mateu = MiniMateu.withUis(ArticlesCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    repository = articles;
    articles.deleteAll();
    articles.saveAll(
        List.of(
            new Article("1", "Spring Data in Action", 300),
            new Article("2", "JPA Basics", 120),
            new Article("3", "Data Modelling", 250)));
  }

  private UIIncrementDto run(
      String route, String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/articles")
            .serverSideType(ArticlesCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  @SuppressWarnings("unchecked")
  private static io.mateu.uidl.data.Page<Object> pageOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data
          && data.get("crud") instanceof io.mateu.uidl.data.ListingData<?> listing) {
        return (io.mateu.uidl.data.Page<Object>) listing.page();
      }
    }
    throw new AssertionError("no listing data in " + increment);
  }

  private static String titleOf(Object row) {
    if (row instanceof Article article) {
      return article.title;
    }
    if (row instanceof Map<?, ?> map) {
      return String.valueOf(map.get("title"));
    }
    return String.valueOf(row);
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

  private static Map<String, Object> articleState(String title, long version) {
    var state = new HashMap<String, Object>();
    state.put("id", "1");
    state.put("title", title);
    state.put("pages", 300);
    state.put("version", version);
    return state;
  }

  @Test
  void theListingSearchRunsThroughTheJpaStore() {
    var page =
        pageOf(
            run("/articles", "search", Map.of("page", 0, "size", 2, "searchText", "data"), null));
    assertThat(page.totalElements()).isEqualTo(2);
    assertThat(page.content())
        .extracting(JpaAutoCrudSyncTest::titleOf)
        .containsExactlyInAnyOrder("Spring Data in Action", "Data Modelling");

    var firstPage = pageOf(run("/articles", "search", Map.of("page", 0, "size", 2), null));
    assertThat(firstPage.totalElements()).isEqualTo(3);
    assertThat(firstPage.content()).hasSize(2);
  }

  @Test
  void aSaveGoesThroughAndTheProviderMovesTheVersion() {
    var increment = run("/articles/1/edit", "save", articleState("Renamed", 0), null);
    assertThat(findDialog(increment)).isNull();
    var stored = articles.findById("1").orElseThrow();
    assertThat(stored.title).isEqualTo("Renamed");
    assertThat(stored.version).isEqualTo(1);
  }

  @Test
  void aStaleSaveOpensTheConflictDialogAndPersistsNothing() {
    run("/articles/1/edit", "save", articleState("Their change", 0), null);
    var increment = run("/articles/1/edit", "save", articleState("My change", 0), null);
    var dialog = findDialog(increment);
    assertThat(dialog).isNotNull();
    assertThat(dialog.headerTitle()).isEqualTo("Modificado por otro usuario");
    var stored = articles.findById("1").orElseThrow();
    assertThat(stored.title).isEqualTo("Their change");
    assertThat(stored.version).isEqualTo(1);
  }

  @Test
  void overwriteFromTheDialogWins() {
    run("/articles/1/edit", "save", articleState("Their change", 0), null);
    var increment =
        run(
            "/articles/1/edit",
            "save",
            articleState("My change", 0),
            Map.of("_forceOverwrite", true));
    assertThat(findDialog(increment)).isNull();
    var stored = articles.findById("1").orElseThrow();
    assertThat(stored.title).isEqualTo("My change");
    assertThat(stored.version).isEqualTo(2);
  }

  @Test
  void deleteRemovesTheSelectedRows() {
    run(
        "/articles",
        "delete",
        Map.of("crud_selected_items", List.of(Map.of("id", "2", "title", "JPA Basics"))),
        null);
    assertThat(articles.findAll())
        .extracting(article -> article.id)
        .containsExactlyInAnyOrder("1", "3");
  }
}
