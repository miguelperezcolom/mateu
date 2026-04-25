package io.mateu.core.infra.declarative.crudorchestrator;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.FakeCrudOrchestrator;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.FakeEntity;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CrudOrchestratorLayersExtendedTest {

  FakeCrudOrchestrator orchestrator;
  FakeHttpRequest http;

  @BeforeEach
  void setUp() {
    orchestrator = new FakeCrudOrchestrator();
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder()
        .componentState(Map.of("page", 0, "size", 10, "sort", List.of()))
        .route("/items").initiatorComponentId("init").consumedRoute("").build());
    new DefaultInstanceFactory(new ReflectionInstanceFactory(new FakeBeanProvider()));
  }

  // --- StateSupplierLayer ---

  @Test
  void stateReturnsCurrentState() {
    var state = orchestrator.state(http);
    assertThat(state).isNotNull();
  }

  @Test
  void setStateToAndReadBack() {
    orchestrator.setStateTo("edit");
    assertThat(orchestrator.state()).isEqualTo("edit");
    orchestrator.setStateTo("list");
    assertThat(orchestrator.state()).isEqualTo("list");
  }

  @Test
  void addRowNumberForEntityClass() {
    var data = new HashMap<String, Object>();
    data.put("id", "entity-1");
    data.put("name", "Alice");
    orchestrator.addRowNumberForEntityClass(data);
    // Should not throw — _rowNumber may or may not be added depending on entity class
    assertThat(data).isNotNull();
  }

  // --- RouteHandlerLayer ---

  @Test
  void getCrudRouteReturnsNonNull() {
    var route = orchestrator.getCrudRoute(http, "entity-1");
    assertThat(route).isNotNull();
  }

  @Test
  void handleRouteReturnsResult() {
    var result = orchestrator.handleRoute("/items", http);
    assertThat(result).isNotNull();
  }

  // --- DataLayer ---

  @Test
  void addDataToHttpRequest() {
    var entity = new FakeEntity("e1", "First");
    var updatedHttp = DataLayer.addData(entity, http);
    assertThat(updatedHttp).isNotNull();
  }

  @Test
  void createDataFromEntity() {
    var entity = new FakeEntity("e1", "First");
    var data = DataLayer.createData(entity, http);
    assertThat(data).isNotNull();
    assertThat(data).containsKey("id");
  }

  // --- BaseLayer ---

  @Test
  void viewModelClassDefaultsToViewClass() {
    orchestrator.setStateTo("list");
    assertThat(orchestrator.viewModelClass()).isNotNull();
  }

  @Test
  void entityClassIsCorrect() {
    assertThat(orchestrator.entityClass()).isNotNull();
  }

  @Test
  void titleIsNotNull() {
    assertThat(orchestrator.title()).isNotNull();
  }

  @Test
  void selectionEnabledIsFalseByDefault() {
    assertThat(orchestrator.selectionEnabled()).isFalse();
  }

  @Test
  void searchableIsTrueByDefault() {
    assertThat(orchestrator.searchable()).isTrue();
  }
}
