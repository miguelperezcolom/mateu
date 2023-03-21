package io.mateu.remote.domain.mappers;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Step;

public class StepMapper {
    public Step map(String id, Object formInstance) throws Exception {
        return Step.builder()
                .id(id)
                .type(formInstance.getClass().getName())
                .name(ReflectionHelper.getCaption(formInstance))
                .view(new ViewMapper().map(formInstance))
                .build();
    }
}
