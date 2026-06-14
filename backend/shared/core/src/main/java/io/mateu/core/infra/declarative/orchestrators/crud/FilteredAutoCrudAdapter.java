package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;

class FilteredAutoCrudAdapter<Filters, Row extends Identifiable>
    implements CrudAdapter<Object, Object, Object, Filters, Row, String> {

  private final FilteredAutoCrudOrchestrator<Filters, Row> orchestrator;

  FilteredAutoCrudAdapter(FilteredAutoCrudOrchestrator<Filters, Row> orchestrator) {
    this.orchestrator = orchestrator;
  }

  @Override
  public ListingData<Row> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
    return orchestrator.doSearch(searchText, filters, pageable, httpRequest);
  }

  @Override
  public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
    orchestrator.repository().deleteAllById(selectedIds);
  }

  @Override
  public Object getView(String id, HttpRequest httpRequest) {
    var entity = orchestrator.repository().findById(id).orElseThrow();
    return new AutoNamedView<>(rowClass(), entity, orchestrator.repository());
  }

  @Override
  public Object getEditor(String id, HttpRequest httpRequest) {
    var entity = orchestrator.repository().findById(id).orElseThrow();
    return new AutoNamedView<>(rowClass(), entity, orchestrator.repository());
  }

  @SneakyThrows
  @Override
  public Object getCreationForm(HttpRequest httpRequest) {
    Map<String, Object> data = Map.of();
    if ("create".equals(httpRequest.runActionRq().actionId())) {
      if (httpRequest.runActionRq().parameters() != null) {
        if (httpRequest.runActionRq().parameters().containsKey("initiatorState")) {
          data = (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
        }
      }
    }
    var instance =
        MateuBeanProvider.getBean(InstanceFactory.class)
            .newInstance(rowClass(), data, httpRequest);
    return new AutoNamedView<>(rowClass(), instance, orchestrator.repository());
  }

  @SneakyThrows
  Row toEntity(HttpRequest httpRequest) {
    var initiatorState =
        (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
    if (initiatorState != null) {
      return MateuInstanceFactory.newInstance(rowClass(), initiatorState, httpRequest);
    }
    return httpRequest.getComponentState(rowClass());
  }

  private Class<Row> rowClass() {
    return getGenericClass(orchestrator.getClass(), FilteredAutoCrudOrchestrator.class, "Row");
  }
}
