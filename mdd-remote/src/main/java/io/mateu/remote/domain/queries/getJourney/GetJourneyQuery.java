package io.mateu.remote.domain.queries.getJourney;

import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import lombok.Builder;
import lombok.Getter;


@Builder
@Getter
public class GetJourneyQuery {

    private String journeyTypeId;

    private String journeyId;

}
