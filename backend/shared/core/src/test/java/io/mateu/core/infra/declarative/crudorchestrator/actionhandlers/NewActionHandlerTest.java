package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NewActionHandlerTest {

  @Mock CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final NewActionHandler handler = new NewActionHandler();

  @Test
  void supportsOnlyNewAction() {
    assertThat(handler.supports("new")).isTrue();
    assertThat(handler.supports("create")).isFalse();
    assertThat(handler.supports("save")).isFalse();
  }

  @Test
  void alwaysRedirectsToNewRoute() {
    var initial = CrudActionResult.of("new");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.route()).isEqualTo("/new");
  }

  @Test
  void noSavedId() {
    var initial = CrudActionResult.of("new");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.savedId()).isNull();
  }

  @Test
  void noMessages() {
    var initial = CrudActionResult.of("new");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.messages()).isEmpty();
  }
}
