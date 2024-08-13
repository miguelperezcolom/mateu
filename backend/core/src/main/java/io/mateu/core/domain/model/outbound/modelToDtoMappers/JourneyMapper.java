package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.dtos.Journey;
import io.mateu.dtos.JourneyStatus;

public class JourneyMapper {

  public Journey map(Object formInstance) {

    return new Journey(
            formInstance.getClass().getName(),
            JourneyStatus.Pending,
            "Please fill the form",
            getStepId(formInstance),
            getStepId(formInstance)
    );
  }

  private String getStepId(Object formInstance) {
    if (formInstance instanceof MDDOpenCRUDAction) {
      return "list";
    }
    return formInstance.getClass().getName();
  }
}
