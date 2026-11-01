package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;

/**
 * A mocked crud that may create, edit and delete — what a real {@code AutoCrud} answers by default.
 * The handlers consult {@code CrudWriteGate} before writing, and a bare Mockito mock says {@code
 * false} to every {@code canX()}, so it would be refused (403) like a locked crud.
 */
final class CrudMocks {

  private CrudMocks() {}

  @SuppressWarnings({"unchecked", "rawtypes"})
  static void allowWrites(Crud orchestrator) {
    lenient().when(orchestrator.canCreate()).thenReturn(true);
    lenient().when(orchestrator.canEdit()).thenReturn(true);
    lenient().when(orchestrator.canDelete()).thenReturn(true);
    lenient().when(orchestrator.canView()).thenReturn(true);
    lenient().when(orchestrator.toId(anyString())).thenAnswer(call -> call.getArgument(0));
  }
}
