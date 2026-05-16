package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CancelCreateActionHandlerTest {

  @Mock CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final CancelCreateActionHandler handler = new CancelCreateActionHandler();

  @Test
  void supportsOnlyCancelCreateAction() {
    assertThat(handler.supports("cancel-create")).isTrue();
    assertThat(handler.supports("cancel-edit")).isFalse();
    assertThat(handler.supports("cancel-view")).isFalse();
  }

  @Test
  void alwaysRedirectsToList() {
    var initial = CrudActionResult.of("cancel-create");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.route()).isEqualTo("/list");
  }

  @Test
  void noMessages() {
    var initial = CrudActionResult.of("cancel-create");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.messages()).isEmpty();
  }
}
