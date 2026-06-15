package io.mateu.core.infra.declarative.orchestrators.crud;


import io.mateu.core.infra.declarative.SimpleView;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;

public abstract class FilteredAutoCrudOrchestrator<Filters, Row extends Identifiable>
    extends CrudOrchestrator<
        SimpleView<Row>, SimpleView<Row>, SimpleView<Row>, Filters, Row, String> {

  @Override
  public final Object search(
      String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
    return adapter().search(searchText, (Filters) filters, pageable, httpRequest);
  }
}
