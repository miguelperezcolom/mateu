package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapToTrigger;

import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

final class CrudTriggersBuilder {

  static List<TriggerDto> build(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crud, String viewName, HttpRequest httpRequest) {
    var triggers = new ArrayList<TriggerDto>();
    if (httpRequest.getAttribute("list") != null) {
      triggers.add(new OnLoadTriggerDto("search", 0, 1, null));
    }
    for (io.mateu.uidl.annotations.Trigger annotation :
        crud.getClass().getAnnotationsByType(io.mateu.uidl.annotations.Trigger.class)) {
      triggers.add(mapToTrigger(annotation));
    }
    return triggers;
  }

  private CrudTriggersBuilder() {}
}
