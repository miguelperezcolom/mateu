package io.mateu.remote.domain;

import io.mateu.remote.dtos.Step;

import java.io.IOException;

public class StepMapper {
    public Step map(Object formInstance) throws Exception {
        return Step.builder()
                .name("")
                .view(new ViewMapper().map(formInstance))
                .build();
    }
}
