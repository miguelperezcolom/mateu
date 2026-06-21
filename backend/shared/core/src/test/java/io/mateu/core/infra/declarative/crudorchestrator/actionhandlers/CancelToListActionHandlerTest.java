package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CancelToListActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CancelToListActionHandlerTest {

  @Mock Crud<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final CancelToListActionHandler handler = new CancelToListActionHandler();

  @Test
  void supportsCancelNewAndCancelView() {
    assertThat(handler.supports("cancel-new", httpRequest)).isTrue();
    assertThat(handler.supports("cancel-view", httpRequest)).isTrue();
    assertThat(handler.supports("cancel-edit", httpRequest)).isFalse();
    assertThat(handler.supports("save", httpRequest)).isFalse();
  }

  @Test
  void alwaysRedirectsToList() {
    assertThat(
            ((CrudActionResult) handler.handleAction("cancel-new", httpRequest, orchestrator))
                .route())
        .isEqualTo("/list");
    assertThat(
            ((CrudActionResult) handler.handleAction("cancel-view", httpRequest, orchestrator))
                .route())
        .isEqualTo("/list");
  }

  @Test
  void noMessages() {
    var result = (CrudActionResult) handler.handleAction("cancel-new", httpRequest, orchestrator);
    assertThat(result.messages()).isEmpty();
  }
}
