package io.mateu.remote.domain.queries.getStep;

import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import lombok.Builder;
import lombok.Getter;


@Builder
@Getter
public class GetStepQuery {

    private String journeyId;

    private String stepId;

}
