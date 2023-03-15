package io.mateu.remote.domain;

import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.JourneyStatus;

import java.util.UUID;

public class JourneyMapper {

    public Journey map(Object formInstance) {

        return Journey.builder()
                .type(formInstance.getClass().getName())
                .currentStepId(formInstance.getClass().getName())
                .currentStepDefinitionId(formInstance.getClass().getName())
                .status(JourneyStatus.Pending)
                .statusMessage("Please fill the form")
                .build();

    }
}
