package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapToTrigger;

import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

final class CrudTriggersBuilder {

  static List<Trigger> build(
      Crud<?, ?, ?, ?, ?, ?> crud, String viewName, HttpRequest httpRequest) {
    var triggers = new ArrayList<Trigger>();
    if (httpRequest.getAttribute("list") != null) {
      triggers.add(new OnLoadTrigger("search", 0, 1, null));
    }
    for (io.mateu.uidl.annotations.Trigger annotation :
        crud.getClass().getAnnotationsByType(io.mateu.uidl.annotations.Trigger.class)) {
      triggers.add(mapToTrigger(annotation));
    }
    return triggers;
  }

  private CrudTriggersBuilder() {}
}
