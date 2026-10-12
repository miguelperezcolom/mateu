package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The shape of the code starters: a root {@code @UI("")} app whose {@code @Menu} entries lead to
 * classes with no {@code @UI} of their own. The Vaadin shell loads an entry's content naming the
 * app's type; a renderer that loads content by ROUTE ALONE (the Redwood shell) must get the same
 * screen — it used to answer "Not found", so a generated Redwood project opened on an empty page.
 */
class RootAppMenuContentSyncTest {

  record Item(String id, String name) implements Identifiable {}

  static class ItemStore implements CrudStore<Item> {
    static final ItemStore INSTANCE = new ItemStore();

    @Override
    public Optional<Item> findById(String id) {
      return "I-1".equals(id) ? Optional.of(new Item("I-1", "First item")) : Optional.empty();
    }

    @Override
    public String save(Item entity) {
      return entity.id();
    }

    @Override
    public List<Item> findAll() {
      return List.of(new Item("I-1", "First item"));
    }

    @Override
    public void deleteAllById(List<String> ids) {}
  }

  /** The home page: a plain form with no @UI. */
  @Title("Landing home")
  public static class LandingHome {
    String greeting = "Welcome aboard";
  }

  /** The CRUD: no @UI, reached through its menu entry. */
  @Title("Items")
  public static class LandingItems extends AutoCrud<Item> {
    @Override
    public CrudStore<Item> store() {
      return ItemStore.INSTANCE;
    }
  }

  @UI("")
  @Title("Landing")
  public static class LandingShell implements HomeRouteSupplier {
    @Menu LandingHome home;
    @Menu LandingItems items;

    @Override
    public String homeRoute() {
      return "home";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // own harness: a root app changes route resolution for every other fixture
    mateu = TestMateu.withUis(LandingShell.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String contentLoad(String route, String serverSideType) {
    return JsonSerializer.toJson(
        mateu.run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute("")
                .serverSideType(serverSideType)
                .actionId("")
                .initiatorComponentId("content")
                .componentState(Map.of())
                .build()));
  }

  @Test
  void aMenuRouteLoadedByRouteAloneAnswersItsScreen() {
    var wire = contentLoad("/home", null);
    assertThat(wire).contains(LandingHome.class.getName()).contains("Welcome aboard");
    assertThat(wire).doesNotContain("NotFound");
  }

  @Test
  void itIsTheSameScreenTheLoadNamingTheAppAnswers() {
    assertThat(contentLoad("/home", LandingShell.class.getName()))
        .contains(LandingHome.class.getName())
        .contains("Welcome aboard");
  }

  @Test
  void aCrudMenuRouteAndItsRecordPageResolveByRouteAlone() {
    assertThat(contentLoad("/items", null)).contains(LandingItems.class.getName());
    // the CRUD mediator, aimed at the record page (which the client then loads inside it)
    assertThat(contentLoad("/items/I-1", null))
        .contains(LandingItems.class.getName())
        .contains("\"_route\" : \"/I-1\"");
  }

  @Test
  void aRouteNoMenuEntryClaimsIsStillNotFound() {
    assertThat(contentLoad("/nowhere", null)).contains("NotFound");
  }
}
