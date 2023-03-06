package io.mateu.remote.domain.queries;

import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.dtos.Step;
import lombok.Builder;


@Builder
public class GetStepQuery {


    private String journeyId;

    private String stepId;

    public Step run() throws Exception {

        return JourneyStoreAccessor.get().getStep(stepId);


    }


}
