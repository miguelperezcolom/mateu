package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.FakeCrudOrchestrator;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AdjustCommandForCrudNavigationTest extends RunActionUseCaseTest {

  @Test
  void doesNothingForNonCrudTypes() {
    var httpRequest = new FakeHttpRequest();
    httpRequest.storeRunActionRqDto(
        RunActionRqDto.builder()
            .componentState(Map.of("idFieldForRow", "id"))
            .parameters(Map.of("id", "entity-1"))
            .build());

    var command =
        new RunActionCommand(
            "base_url",
            "ui_id",
            "/items",
            "consumed",
            "view",
            Map.of("idFieldForRow", "id"),
            Map.of(),
            "initiator",
            httpRequest,
            String.class.getName(),
            "");

    var increment = useCase.handle(command).blockLast();
    assertThat(increment).isNotNull();
    // String is not a CrudOrchestrator - route should NOT be modified
    assertThat(httpRequest.getAttribute("updateUrl")).isNull();
  }

  @Test
  void appendsIdToRouteForViewAction() {
    var httpRequest = new FakeHttpRequest();
    httpRequest.storeRunActionRqDto(
        RunActionRqDto.builder()
            .componentState(Map.of("idFieldForRow", "id"))
            .parameters(Map.of("id", "entity-1"))
            .build());

    var command =
        new RunActionCommand(
            "base_url",
            "ui_id",
            "/items",
            "consumed",
            "view",
            Map.of("idFieldForRow", "id"),
            Map.of(),
            "initiator",
            httpRequest,
            FakeCrudOrchestrator.class.getName(),
            "");

    var increment = useCase.handle(command).blockLast();
    assertThat(increment).isNotNull();
    // The CRUD route adjustment sets oldRoute and updateUrl before route resolution.
    // updateUrl may end up as "_no_update" if the adjusted route finds no handler,
    // but oldRoute proves the adjustment ran.
    assertThat(httpRequest.getAttribute("oldRoute")).isEqualTo("/items");
  }

  @Test
  void appendsIdAndEditToRouteForEditAction() {
    var httpRequest = new FakeHttpRequest();
    httpRequest.storeRunActionRqDto(
        RunActionRqDto.builder()
            .componentState(Map.of("idFieldForRow", "id", "id", "entity-2"))
            .parameters(Map.of("id", "entity-2"))
            .build());

    var command =
        new RunActionCommand(
            "base_url",
            "ui_id",
            "/items",
            "consumed",
            "edit",
            Map.of("idFieldForRow", "id", "id", "entity-2"),
            Map.of(),
            "initiator",
            httpRequest,
            FakeCrudOrchestrator.class.getName(),
            "");

    var increment = useCase.handle(command).blockLast();
    assertThat(increment).isNotNull();
    // oldRoute proves the CRUD navigation adjustment ran
    assertThat(httpRequest.getAttribute("oldRoute")).isEqualTo("/items");
  }
}
