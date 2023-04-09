package io.mateu.remote.domain.queries.getStep;

import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GetStepQueryHandler {

    public Step run(GetStepQuery query)  throws Exception {

        String journeyId = query.getJourneyId();
        String stepId = query.getStepId();

        return JourneyStoreService.get().getStep(journeyId, stepId);

    }

}
