package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.DeleteEditActionHandler;
import io.mateu.dtos.RunActionRqDto;
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
  @Mock HttpRequest httpRequest;

  private final DeleteEditActionHandler handler = new DeleteEditActionHandler();

  @BeforeEach
  @SuppressWarnings("unchecked")
  void setUp() {
    CrudMocks.allowWrites(orchestrator);
    when(orchestrator.getIdFieldForRow()).thenReturn("id");
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
  void fromTheListingItStaysOnTheListingAndRefreshesItInPlace() {
    when(httpRequest.getSelectedRows(Map.class)).thenReturn(null);
    when(orchestrator.route()).thenReturn(Crud.LIST_VIEW);

    var result = (CrudActionResult) handler.handleAction("delete", httpRequest, orchestrator);

    // no navigation (a route the client reads as another place would reload the listing, and
    // that fresh listing would search on load — a second search for one delete)
    assertThat(result.route()).isEqualTo(Crud.LIST_VIEW);
    assertThat(result.commands())
        .singleElement()
        .satisfies(
            command -> {
              assertThat(command.type()).isEqualTo(io.mateu.uidl.data.UICommandType.DispatchEvent);
              assertThat(((io.mateu.uidl.fluent.CustomEvent) command.data()).eventName())
                  .isEqualTo(Crud.LISTING_CHANGED_EVENT);
            });
  }

  @Test
  void fromTheRecordPageItGoesBackToTheListWithoutTheEvent() {
    when(httpRequest.getSelectedRows(Map.class)).thenReturn(null);
    when(orchestrator.route()).thenReturn("edit");

    var result = (CrudActionResult) handler.handleAction("delete", httpRequest, orchestrator);

    // the fresh listing searches on load by itself: the event would be a second search
    assertThat(result.route()).isEqualTo("/list");
    assertThat(result.commands()).isEmpty();
  }

  @Test
  @SuppressWarnings("unchecked")
  void deletesSelectedRowsByExtractedId() {
    var selectedRows =
        List.of(Map.of("id", "id-1", "name", "Item 1"), Map.of("id", "id-2", "name", "Item 2"));
    when(httpRequest.getSelectedRows(Map.class)).thenReturn((List) selectedRows);

    handler.handleAction("delete", httpRequest, orchestrator);

    verify(orchestrator).deleteAllById(eq((List) List.of("id-1", "id-2")), eq(httpRequest));
  }

  @Test
  void doesNotCallDeleteWhenNoSelection() {
    when(httpRequest.getSelectedRows(Map.class)).thenReturn(null);

    handler.handleAction("delete", httpRequest, orchestrator);

    verify(orchestrator, never()).deleteAllById(any(), any());
  }

  @Test
  void noMessages() {
    when(httpRequest.getSelectedRows(Map.class)).thenReturn(null);

    var result = (CrudActionResult) handler.handleAction("delete", httpRequest, orchestrator);

    assertThat(result.messages()).isEmpty();
  }
}
