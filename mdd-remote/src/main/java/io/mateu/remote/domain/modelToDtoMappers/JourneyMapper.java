package io.mateu.remote.domain.modelToDtoMappers;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.JourneyStatus;

public class JourneyMapper {

    public Journey map(Object formInstance) {

        return Journey.builder()
                .type(formInstance.getClass().getName())
                .currentStepId(getStepId(formInstance))
                .currentStepDefinitionId(getStepId(formInstance))
                .status(JourneyStatus.Pending)
                .statusMessage("Please fill the form")
                .build();

    }

    private String getStepId(Object formInstance) {
        if (formInstance instanceof MDDOpenCRUDAction) {
            return "list";
        }
        return formInstance.getClass().getName();
    }
}
