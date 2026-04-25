package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.Message;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class CrudActionHandlerTest {

  FakeCrudOrchestrator orchestrator;
  FakeHttpRequest httpRequest;

  @BeforeEach
  void setUp() {
    orchestrator = new FakeCrudOrchestrator();
    httpRequest = new FakeHttpRequest();
    httpRequest.storeRunActionRqDto(
        RunActionRqDto.builder()
            .componentState(Map.of("id", "entity-1", "idFieldForRow", "id"))
            .build());
  }

  @Nested
  class CreateActionHandlerTest {

    @Test
    void delegatesToSaveNew() {
      var handler = new CreateActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("create"), httpRequest);

      assertThat(orchestrator.saveNewCalled).isTrue();
      assertThat(result.savedId()).isEqualTo("saved-123");
    }

    @Test
    void redirectsToView() {
      var handler = new CreateActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("create"), httpRequest);

      assertThat(result.actionId()).isEqualTo("view");
    }

    @Test
    void addsSuccessMessage() {
      var handler = new CreateActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("create"), httpRequest);

      assertThat(result.messages()).hasSize(1);
      assertThat(result.messages().get(0).text()).contains("saved");
    }

    @Test
    void supportsOnlyCreate() {
      var handler = new CreateActionHandler();

      assertThat(handler.supports("create")).isTrue();
      assertThat(handler.supports("save")).isFalse();
      assertThat(handler.supports("delete")).isFalse();
    }
  }

  @Nested
  class SaveActionHandlerTest {

    @Test
    void delegatesToSave() {
      var handler = new SaveActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("save"), httpRequest);

      assertThat(orchestrator.saveCalled).isTrue();
      assertThat(result.savedId()).isEqualTo("saved-123");
    }

    @Test
    void redirectsToView() {
      var handler = new SaveActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("save"), httpRequest);

      assertThat(result.actionId()).isEqualTo("view");
    }

    @Test
    void addsSuccessMessage() {
      var handler = new SaveActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("save"), httpRequest);

      assertThat(result.messages()).hasSize(1);
      assertThat(result.messages().get(0).text()).contains("saved");
    }

    @Test
    void supportsOnlySave() {
      var handler = new SaveActionHandler();

      assertThat(handler.supports("save")).isTrue();
      assertThat(handler.supports("create")).isFalse();
    }
  }

  @Nested
  class DeleteActionHandlerTest {

    @Test
    void deletesSelectedItems() {
      httpRequest.storeRunActionRqDto(
          RunActionRqDto.builder()
              .componentState(
                  Map.of(
                      "crud_selected_items",
                      List.of(Map.of("id", "entity-1"), Map.of("id", "entity-2"))))
              .build());

      var handler = new DeleteActionHandler();
      handler.handle(orchestrator, CrudActionResult.of("delete"), httpRequest);

      assertThat(orchestrator.deletedIds).containsExactlyInAnyOrder("entity-1", "entity-2");
    }

    @Test
    void keepsActionIdUnchanged() {
      httpRequest.storeRunActionRqDto(
          RunActionRqDto.builder()
              .componentState(Map.of("crud_selected_items", List.of()))
              .build());

      var handler = new DeleteActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("delete"), httpRequest);

      assertThat(result.actionId()).isEqualTo("delete");
    }

    @Test
    void handlesEmptySelection() {
      httpRequest.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());

      var handler = new DeleteActionHandler();
      handler.handle(orchestrator, CrudActionResult.of("delete"), httpRequest);

      assertThat(orchestrator.deletedIds).isEmpty();
    }

    @Test
    void supportsOnlyDelete() {
      var handler = new DeleteActionHandler();

      assertThat(handler.supports("delete")).isTrue();
      assertThat(handler.supports("save")).isFalse();
    }
  }

  @Nested
  class CancelEditActionHandlerTest {

    @Test
    void extractsIdFromComponentState() {
      httpRequest.storeRunActionRqDto(
          RunActionRqDto.builder().componentState(Map.of("id", "entity-1")).build());

      var handler = new CancelEditActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("cancel-edit"), httpRequest);

      assertThat(result.savedId()).isEqualTo("entity-1");
    }

    @Test
    void redirectsToView() {
      httpRequest.storeRunActionRqDto(
          RunActionRqDto.builder().componentState(Map.of("id", "entity-1")).build());

      var handler = new CancelEditActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("cancel-edit"), httpRequest);

      assertThat(result.actionId()).isEqualTo("view");
    }

    @Test
    void supportsOnlyCancelEdit() {
      var handler = new CancelEditActionHandler();

      assertThat(handler.supports("cancel-edit")).isTrue();
      assertThat(handler.supports("cancel-view")).isFalse();
      assertThat(handler.supports("cancel-create")).isFalse();
    }
  }

  @Nested
  class CancelViewActionHandlerTest {

    @Test
    void extractsIdFromComponentState() {
      httpRequest.storeRunActionRqDto(
          RunActionRqDto.builder().componentState(Map.of("id", "entity-1")).build());

      var handler = new CancelViewActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("cancel-view"), httpRequest);

      assertThat(result.savedId()).isEqualTo("entity-1");
    }

    @Test
    void redirectsToListBySettingEmptyActionId() {
      httpRequest.storeRunActionRqDto(
          RunActionRqDto.builder().componentState(Map.of("id", "entity-1")).build());

      var handler = new CancelViewActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("cancel-view"), httpRequest);

      assertThat(result.actionId()).isEqualTo("");
    }

    @Test
    void supportsOnlyCancelView() {
      var handler = new CancelViewActionHandler();

      assertThat(handler.supports("cancel-view")).isTrue();
      assertThat(handler.supports("cancel-edit")).isFalse();
    }
  }

  @Nested
  class CancelCreateActionHandlerTest {

    @Test
    void redirectsToListBySettingEmptyActionId() {
      var handler = new CancelCreateActionHandler();
      var result = handler.handle(orchestrator, CrudActionResult.of("cancel-create"), httpRequest);

      assertThat(result.actionId()).isEqualTo("");
    }

    @Test
    void doesNotChangeSavedId() {
      var handler = new CancelCreateActionHandler();
      var initial = CrudActionResult.of("cancel-create", "some-id");
      var result = handler.handle(orchestrator, initial, httpRequest);

      assertThat(result.savedId()).isEqualTo("some-id");
    }

    @Test
    void supportsOnlyCancelCreate() {
      var handler = new CancelCreateActionHandler();

      assertThat(handler.supports("cancel-create")).isTrue();
      assertThat(handler.supports("cancel-edit")).isFalse();
      assertThat(handler.supports("create")).isFalse();
    }
  }

  @Nested
  class CrudActionResultTest {

    @Test
    void withActionIdCreatesNewRecord() {
      var original = CrudActionResult.of("create", "id-1");
      var updated = original.withActionId("view");

      assertThat(updated.actionId()).isEqualTo("view");
      assertThat(updated.savedId()).isEqualTo("id-1");
      assertThat(original.actionId()).isEqualTo("create");
    }

    @Test
    void withSavedIdCreatesNewRecord() {
      var original = CrudActionResult.of("save");
      var updated = original.withSavedId("new-id");

      assertThat(updated.savedId()).isEqualTo("new-id");
      assertThat(original.savedId()).isNull();
    }

    @Test
    void withMessageAccumulatesMessages() {
      var result = CrudActionResult.of("create");

      result = result.withMessage(Message.builder().text("First").build());
      result = result.withMessage(Message.builder().text("Second").build());

      assertThat(result.messages()).hasSize(2);
    }
  }
}
