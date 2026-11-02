package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * An {@code EditableView}'s write path is enforced on the server, not only undrawn (final review
 * H1): a {@code @ReadOnly} view refuses a forced {@code edit}, {@code save} and the {@code /edit}
 * route (403), and {@code save} re-checks the constraints it tells the client to validate.
 */
class EditableViewGatesSyncTest {

  @SuppressWarnings("unused")
  public static class Profile {
    @NotEmpty String name = "Ada";
  }

  static final List<String> PERSISTED = new ArrayList<>();

  @UI("/ev-open")
  @Title("Open")
  public static class OpenProfileView extends AutoEditableView<Profile> {
    @Override
    public Profile load(HttpRequest httpRequest) {
      return new Profile();
    }

    @Override
    public void persist(Profile entity, HttpRequest httpRequest) {
      PERSISTED.add(entity.name);
    }
  }

  @UI("/ev-readonly")
  @Title("Read only")
  @ReadOnly
  public static class ReadOnlyProfileView extends OpenProfileView {}

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(OpenProfileView.class, ReadOnlyProfileView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    PERSISTED.clear();
  }

  private UIIncrementDto run(
      String route, String consumed, Class<?> type, String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(type.getName())
            .actionId(actionId)
            .initiatorComponentId("ev_app")
            .componentState(state)
            .build());
  }

  private static boolean refused(Runnable call) {
    try {
      call.run();
      return false;
    } catch (RuntimeException e) {
      return MateuForbiddenException.find(e) != null;
    }
  }

  @Test
  void anEditableViewStillSaves() {
    run("/ev-open/edit", "/ev-open", OpenProfileView.class, "save", Map.of("name", "Eva"));
    assertThat(PERSISTED).containsExactly("Eva");
  }

  @Test
  void aReadOnlyViewRefusesAForcedEditAndSave() {
    assertThat(
            refused(
                () ->
                    run(
                        "/ev-readonly",
                        "/ev-readonly",
                        ReadOnlyProfileView.class,
                        "edit",
                        Map.of("name", "Ada"))))
        .isTrue();
    assertThat(
            refused(
                () ->
                    run(
                        "/ev-readonly/edit",
                        "/ev-readonly",
                        ReadOnlyProfileView.class,
                        "save",
                        Map.of("name", "Eva"))))
        .isTrue();
    assertThat(PERSISTED).isEmpty();
  }

  @Test
  void aReadOnlyViewStillRendersItsView() {
    var increment = run("/ev-readonly", "/ev-readonly", ReadOnlyProfileView.class, "", Map.of());
    assertThat(increment).isNotNull();
  }

  @Test
  void saveReChecksTheConstraintsTheClientValidates() {
    try {
      run("/ev-open/edit", "/ev-open", OpenProfileView.class, "save", Map.of("name", ""));
    } catch (RuntimeException e) {
      // refused with the validation text — either answered or thrown, never persisted
    }
    assertThat(PERSISTED).isEmpty();
  }
}
