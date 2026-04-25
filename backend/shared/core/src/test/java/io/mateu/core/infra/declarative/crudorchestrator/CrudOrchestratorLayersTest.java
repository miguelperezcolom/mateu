package io.mateu.core.infra.declarative.crudorchestrator;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.FakeCrudOrchestrator;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CrudOrchestratorLayersTest {

  FakeCrudOrchestrator orchestrator;
  FakeHttpRequest http;

  @BeforeEach
  void setUp() {
    orchestrator = new FakeCrudOrchestrator();
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
    new DefaultInstanceFactory(new ReflectionInstanceFactory(new FakeBeanProvider()));
  }

  @Test void getIdFieldForRowIsId() { assertThat(orchestrator.getIdFieldForRow()).isEqualTo("id"); }
  @Test void viewClassIsNotNull() { assertThat(orchestrator.viewClass()).isNotNull(); }
  @Test void editorClassIsNotNull() { assertThat(orchestrator.editorClass()).isNotNull(); }
  @Test void filtersClassIsNotNull() { assertThat(orchestrator.filtersClass()).isNotNull(); }
  @Test void rowClassIsNotNull() { assertThat(orchestrator.rowClass()).isNotNull(); }
  @Test void adapterIsNotNull() { assertThat(orchestrator.adapter()).isNotNull(); }
  @Test void oneToOneIsFalseByDefault() { assertThat(orchestrator.oneToOne()).isFalse(); }
  @Test void parentIdIsNullByDefault() { assertThat(orchestrator.parentId()).isNull(); }
  @Test void readOnlyIsFalseByDefault() { assertThat(orchestrator.readOnly()).isFalse(); }
  @Test void childCrudIsFalseByDefault() { assertThat(orchestrator.childCrud()).isFalse(); }

  @Test void saveNewCallsDelegate() {
    orchestrator.saveNew(http);
    assertThat(orchestrator.saveNewCalled).isTrue();
  }

  @Test void saveCallsDelegate() {
    orchestrator.save(http);
    assertThat(orchestrator.saveCalled).isTrue();
  }

  private FakeHttpRequest httpWith(String route) {
    var h = new FakeHttpRequest();
    h.storeRunActionRqDto(RunActionRqDto.builder()
        .componentState(java.util.Map.of("page", 0, "size", 10, "sort", java.util.List.of()))
        .route(route)
        .initiatorComponentId("init")
        .consumedRoute("")
        .build());
    return h;
  }

  @Test void listComponentIsNotNull() { assertThat(orchestrator.list(httpWith("/items"))).isNotNull(); }
  @Test void handleNewAction() { assertThat(orchestrator.handleAction("new", httpWith("/items"))).isNotNull(); }
  @Test void handleSearchAction() { assertThat(orchestrator.handleAction("search", httpWith("/items"))).isNotNull(); }

  @Test void viewModelClassInListState() { orchestrator.setStateTo("list"); assertThat(orchestrator.viewModelClass()).isNotNull(); }
  @Test void viewModelClassInEditState() { orchestrator.setStateTo("edit"); assertThat(orchestrator.viewModelClass()).isNotNull(); }
  @Test void viewModelClassInCreateState() { orchestrator.setStateTo("create"); assertThat(orchestrator.viewModelClass()).isNotNull(); }
  @Test void viewModelClassInViewState() { orchestrator.setStateTo("view"); assertThat(orchestrator.viewModelClass()).isNotNull(); }
}
