package io.mateu.remote.domain.queries.getJourney;

import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GetJourneyQueryHandler {

    public Journey run(GetJourneyQuery query) throws Exception {

        String journeyId = query.getJourneyId();

        return JourneyStoreService.get().getJourney(journeyId);

    }
}
