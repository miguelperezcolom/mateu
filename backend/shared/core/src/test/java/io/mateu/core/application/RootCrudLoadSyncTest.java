package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A crud mounted at the ROOT ({@code @UI("")}) on a shell that is not the web client's: the
 * Redwood/VB shell bootstraps with {@code actionId "__load__"} (the web client sends {@code ""})
 * and loads the content with the mount root consumed. {@code "__load__"} used to reach the crud as
 * an action ("__load__ not supported by Products", logged as an ERROR), and a consumed route of
 * {@code "/"} made the crud read its own home as a record id ("Not found").
 */
class RootCrudLoadSyncTest {

  public static class Item implements Identifiable {
    String id;
    String name;

    public Item() {}

    public Item(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  @UI("")
  @Title("Items at the root")
  public static class RootItems extends AutoCrud<Item> {
    @Override
    public CrudStore<Item> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Item> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(Item entity) {
          return entity.id();
        }

        @Override
        public List<Item> findAll() {
          return List.of(new Item("1", "Widget"));
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RootItems.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theBootstrapLoadOfARootCrudAnswersTheCrudNotAnError() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("")
                .actionId("__load__")
                .initiatorComponentId("shell")
                .componentState(Map.of())
                .build());
    assertThat(increment.messages()).isEmpty();
    assertThat(JsonSerializer.toJson(increment)).contains(RootItems.class.getName());
  }

  @Test
  void theMountRootConsumedAsSlashIsTheListingNotARecord() {
    for (var consumed : List.of("", "/")) {
      var wire =
          JsonSerializer.toJson(
              mateu.run(
                  RunActionRqDto.builder()
                      .route("")
                      .consumedRoute(consumed)
                      .serverSideType(RootItems.class.getName())
                      .actionId("")
                      .initiatorComponentId("")
                      .componentState(Map.of())
                      .build()));
      assertThat(wire).as("consumed [%s]", consumed).doesNotContain("NotFound");
      assertThat(wire).as("consumed [%s]", consumed).contains("Items at the root");
    }
  }
}
