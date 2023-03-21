package io.mateu.remote.domain.queries;

import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import lombok.Builder;


@Builder
public class GetStepQuery {


    private String journeyId;

    private String stepId;

    public Step run() throws Exception {

        return JourneyStoreService.get().getStep(journeyId, stepId);

    }


}
