package io.mateu.remote.domain.mappers;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.dtos.Step;

public class StepMapper {
    public Step map(JourneyContainer journeyContainer, String stepId, Object formInstance) throws Throwable {
        return Step.builder()
                .id(stepId)
                .type(formInstance.getClass().getName())
                .name(ReflectionHelper.getCaption(formInstance))
                .view(new ViewMapper().map(journeyContainer, stepId, formInstance))
                .build();
    }
}
