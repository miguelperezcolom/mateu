package io.mateu.remote.domain.mappers;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.dtos.Step;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StepMapper {

    @Autowired
    private ViewMapper viewMapper;

    public Step map(JourneyContainer journeyContainer, String stepId, String previousStepId, Object formInstance)
            throws Throwable {
        return Step.builder()
                .id(stepId)
                .type(formInstance.getClass().getName())
                .name(ReflectionHelper.getCaption(formInstance))
                .view(viewMapper.map(journeyContainer, stepId, formInstance))
                .previousStepId(previousStepId)
                .build();
    }
}
