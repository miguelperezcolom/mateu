package io.mateu.remote.domain.queries;

import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import lombok.Builder;


@Builder
public class GetJourneyQuery {

    private String journeyId;

    public Journey run() throws Exception {

        return JourneyStoreService.get().getJourney(journeyId);

    }
}
