package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
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
 * An actionId that names nothing is a refused request (403, one WARN line), not an application
 * error — on a CRUD exactly as on any other view (M-S8). It used to throw an
 * UnsupportedOperationException on a CRUD: an ERROR with a stack trace and a reference id, which
 * anyone could repeat at will with random ids.
 */
class UnknownActionSyncTest {

  public record Item(String id, String name) implements Identifiable {}

  @UI("/unknown-items")
  public static class Items
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Item> {
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
          return List.of();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  @UI("/unknown-form")
  public static class Form {
    public String name;

    @Button
    public void ok() {}
  }

  @UI("/unknown-refreshing")
  public static class Refreshing implements io.mateu.uidl.fluent.ActionSupplier {
    public String name;

    @Override
    public List<io.mateu.uidl.fluent.Action> actions(io.mateu.uidl.interfaces.HttpRequest rq) {
      return List.of(io.mateu.uidl.fluent.Action.builder().id("refresh").build());
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Items.class, Form.class, Refreshing.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static RunActionRqDto rq(String route, Class<?> type, String actionId) {
    return RunActionRqDto.builder()
        .route(route)
        .consumedRoute(route)
        .serverSideType(type.getName())
        .actionId(actionId)
        .componentState(Map.of())
        .parameters(Map.of())
        .initiatorComponentId("c1")
        .build();
  }

  @Test
  void anUnknownActionOnACrudIsRefused() {
    assertThatThrownBy(() -> mateu.run(rq("/unknown-items", Items.class, "store")))
        .satisfies(
            e ->
                org.assertj.core.api.Assertions.assertThat(MateuForbiddenException.find(e))
                    .isNotNull());
  }

  /**
   * A plain view refuses an id that names nothing, exactly like a CRUD: it used to re-render itself
   * with HTTP 200 — an unknown id was indistinguishable from a working one.
   */
  @Test
  void anUnknownActionOnAPlainViewIsRefused() {
    assertThatThrownBy(() -> mateu.run(rq("/unknown-form", Form.class, "noSuchThing")))
        .satisfies(
            e ->
                org.assertj.core.api.Assertions.assertThat(MateuForbiddenException.find(e))
                    .isNotNull());
  }

  /** An id the view advertises (its action list names a refresh) still re-renders it. */
  @Test
  void anAdvertisedIdWithoutAMethodReRendersTheView() {
    org.assertj.core.api.Assertions.assertThat(
            mateu.run(rq("/unknown-refreshing", Refreshing.class, "refresh")).fragments())
        .isNotEmpty();
  }

  /** The route load and a marked action keep working. */
  @Test
  void theLoadAndADeclaredActionStillRun() {
    org.assertj.core.api.Assertions.assertThat(
            mateu.run(rq("/unknown-form", Form.class, "")).fragments())
        .isNotEmpty();
    org.assertj.core.api.Assertions.assertThat(
            mateu.run(rq("/unknown-form", Form.class, "ok")).fragments())
        .isNotEmpty();
  }
}
