package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.DeleteEditActionHandler;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DeleteActionHandlerTest {

  @Mock Crud<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock CrudAdapter<?, ?, ?, ?, ?> adapter;
  @Mock HttpRequest httpRequest;

  private final DeleteEditActionHandler handler = new DeleteEditActionHandler();

  @BeforeEach
  @SuppressWarnings("unchecked")
  void setUp() {
    when(orchestrator.getIdFieldForRow()).thenReturn("id");
    when(orchestrator.adapter()).thenAnswer(inv -> adapter);
    when(httpRequest.runActionRq())
        .thenReturn(RunActionRqDto.builder().initiatorComponentId("test_app").build());
  }

  @Test
  void supportsOnlyDeleteAction() {
    assertThat(handler.supports("delete", httpRequest)).isTrue();
    assertThat(handler.supports("save", httpRequest)).isFalse();
    assertThat(handler.supports("cancel-edit", httpRequest)).isFalse();
  }

  @Test
  void alwaysRedirectsToList() {
    when(httpRequest.getSelectedRows(Map.class)).thenReturn(null);

    var result = (CrudActionResult) handler.handleAction("delete", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/list");
  }

  @Test
  @SuppressWarnings("unchecked")
  void deletesSelectedRowsByExtractedId() {
    var selectedRows =
        List.of(Map.of("id", "id-1", "name", "Item 1"), Map.of("id", "id-2", "name", "Item 2"));
    when(httpRequest.getSelectedRows(Map.class)).thenReturn((List) selectedRows);

    handler.handleAction("delete", httpRequest, orchestrator);

    verify(adapter).deleteAllById(eq((List) List.of("id-1", "id-2")), eq(httpRequest));
  }

  @Test
  void doesNotCallDeleteWhenNoSelection() {
    when(httpRequest.getSelectedRows(Map.class)).thenReturn(null);

    handler.handleAction("delete", httpRequest, orchestrator);

    verify(adapter, never()).deleteAllById(any(), any());
  }

  @Test
  void noMessages() {
    when(httpRequest.getSelectedRows(Map.class)).thenReturn(null);

    var result = (CrudActionResult) handler.handleAction("delete", httpRequest, orchestrator);

    assertThat(result.messages()).isEmpty();
  }
}
