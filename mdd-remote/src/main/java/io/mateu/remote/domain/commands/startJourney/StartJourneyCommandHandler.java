package io.mateu.remote.domain.commands.startJourney;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.modelToDtoMappers.JourneyMapper;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@Slf4j
public class StartJourneyCommandHandler {

    @Autowired
    MateuRemoteClient mateuRemoteClient;
    @Autowired
    JourneyStoreService store;


    public Mono<Void> handle(StartJourneyCommand command) throws Throwable {

        String journeyId = command.getJourneyId();
        String journeyTypeId = command.getJourneyTypeId();
        ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

        Journey journey = null;
        Object formInstance = null;

        JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);
        if (journeyContainer == null) {

            try {

                formInstance = store.createInstanceFromJourneyTypeId(journeyTypeId, serverHttpRequest);

                if (formInstance == null) {
                    throw new Exception();
                }

                // we are passing the form instance to avoid creating a new form instance,
                // even though we already have the step definition id, and we could recreate it
                journey = new JourneyMapper().map(formInstance);

                if (formInstance instanceof RemoteJourney) {
                    RemoteJourney remoteJourney = (RemoteJourney) formInstance;

                    store(journeyId, journeyTypeId, journey, remoteJourney.getBaseUrl(), remoteJourney.getJourneyTypeId());
                    return mateuRemoteClient.startJourney(remoteJourney.getBaseUrl(),
                            remoteJourney.getJourneyTypeId(), journeyId, serverHttpRequest);
                }


            } catch (Exception e) {
                e.printStackTrace();
                log.error("error on getUi", e);
                throw new NotFoundException("No class with name " + journeyTypeId + " found");
            }

            Step step = store.getStepMapper()
                    .map(journeyContainer, getStepId(formInstance), null, formInstance, serverHttpRequest);
            journey.setCurrentStepId(step.getId());
            journey.setCurrentStepDefinitionId(step.getType());
            store(journeyId, journeyTypeId, journey, step);

        } else {
            journeyContainer.reset();
        }

        return Mono.empty();
    }

    private String getStepId(Object formInstance) {
        if (formInstance instanceof Listing) return "list";
        return "form";
    }

    private void store(String journeyId, String journeyTypeId, Journey journey, Step step) {
        JourneyContainer journeyContainer = JourneyContainer.builder()
                .journeyId(journeyId)
                .journeyTypeId(journeyTypeId)
                .journey(journey)
                .steps(Map.of(step.getId(), step))
                .initialStep(step)
                .build();
        store.save(journeyContainer);
    }

    private void store(String journeyId, String journeyTypeId, Journey journey,
                       String remoteBaseUrl, String remoteJourneyTypeId) {
        JourneyContainer journeyContainer = JourneyContainer.builder()
                .journeyId(journeyId)
                .journeyTypeId(journeyTypeId)
                .journey(journey)
                .steps(Map.of())
                .initialStep(null)
                .remoteBaseUrl(remoteBaseUrl)
                .remoteJourneyTypeId(remoteJourneyTypeId)
                .build();
        store.save(journeyContainer);
    }

}
