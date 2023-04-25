package io.mateu.remote.domain.queries.getStep;

import com.google.common.base.Strings;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetStepQueryHandler {

    @Autowired
    JourneyStoreService store;

    @Autowired
    MateuRemoteClient mateuRemoteClient;


    public Mono<Step> run(GetStepQuery query)  throws Exception {

        String journeyId = query.getJourneyId();
        String stepId = query.getStepId();

        JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);

        if (journeyContainer == null) {
            throw new Exception("No journey with id " + journeyId);
        }

        if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
            return mateuRemoteClient.getStep(journeyContainer.getRemoteBaseUrl(),
                    journeyContainer.getRemoteJourneyTypeId(), journeyContainer.getJourneyId(), stepId);
        }


        dump(journeyContainer);

        return Mono.just(store.getStep(journeyId, stepId));

    }

    private void dump(JourneyContainer journeyContainer) {

        log.info("-------------------------------------");
        log.info("journey id: " + journeyContainer.getJourneyId());
        journeyContainer.getSteps().values().stream().forEach(s -> {
            log.info("step: " + s.getId());
            log.info("previous: " + s.getPreviousStepId());
            try {
                log.info("data: " + Helper.toJson(s.getData()));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });

    }

}
