package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;

class FilteredAutoListAdapter<Filters, Row extends Identifiable>
    implements CrudAdapter<Object, Object, Object, Filters, Row, String> {

  private final FilteredAutoListOrchestrator<Filters, Row> orchestrator;

  FilteredAutoListAdapter(FilteredAutoListOrchestrator<Filters, Row> orchestrator) {
    this.orchestrator = orchestrator;
  }

  @Override
  public ListingData<Row> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
    return orchestrator.doSearch(searchText, filters, pageable, httpRequest);
  }

  @Override
  public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only adapter");
  }

  @Override
  public Object getView(String id, HttpRequest httpRequest) {
    return orchestrator.view(id, httpRequest);
  }

  @Override
  public Object getEditor(String id, HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only adapter");
  }

  @Override
  public Object getCreationForm(HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only adapter");
  }
}
