package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * End-to-end (in-JVM) exercise of the sync pipeline: route resolution → instance creation →
 * reflective mapping → wire DTOs, exactly as a /mateu/v3/sync request would flow through a
 * generated controller. This is the harness smoke test — feature-specific pipelines get their own
 * test classes.
 */
class FullSyncPipelineTest {

  @SuppressWarnings("unused")
  @UI("/personas")
  @Title("Personas")
  public static class PersonForm {

    @Section("Datos personales")
    @Label("Nombre")
    String name = "Ada";

    @Label("Fecha de nacimiento")
    LocalDate birth = LocalDate.of(1815, 12, 10);

    @Section("Estado")
    @Label("Activa")
    boolean active = true;

    int visits = 3;

    @Action
    void greet(HttpRequest httpRequest) {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PersonForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void syncOfARoutedFormProducesAServerSideComponentWithItsState() {
    var increment = mateu.sync("/personas");

    assertThat(increment.fragments()).isNotEmpty();
    var fragment = increment.fragments().get(0);
    assertThat(fragment.component()).isInstanceOf(ServerSideComponentDto.class);
    var component = (ServerSideComponentDto) fragment.component();
    assertThat(component.serverSideType()).isEqualTo(PersonForm.class.getName());
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) fragment.state();
    assertThat(state)
        .containsEntry("name", "Ada")
        .containsEntry("active", true)
        .containsEntry("visits", 3);
  }

  @Test
  void syncTitleTravelsAsPageMetadata() {
    var increment = mateu.sync("/personas");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    var page = findMetadata(component, io.mateu.dtos.PageDto.class);
    assertThat(page).isNotNull();
    assertThat(page.title()).isEqualTo("Personas");
  }

  @Test
  void runningAnActionOnTheFormReturnsAnIncrement() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/personas")
                .actionId("greet")
                .serverSideType(PersonForm.class.getName())
                .componentState(Map.of("name", "Eva", "active", false, "visits", 1))
                .build());
    assertThat(increment).isNotNull();
  }

  /** Depth-first search for a metadata DTO of the given type in the component tree. */
  static <T> T findMetadata(Object component, Class<T> type) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (type.isInstance(client.metadata())) {
        return type.cast(client.metadata());
      }
      for (var child : client.children()) {
        var found = findMetadata(child, type);
        if (found != null) {
          return found;
        }
      }
    }
    if (component instanceof ServerSideComponentDto server) {
      for (var child : server.children()) {
        var found = findMetadata(child, type);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }
}
