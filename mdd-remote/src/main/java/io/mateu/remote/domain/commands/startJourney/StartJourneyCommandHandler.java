package io.mateu.remote.domain.commands.startJourney;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.mappers.JourneyMapper;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class StartJourneyCommandHandler {

    @Autowired
    MateuRemoteClient mateuRemoteClient;

    public void handle(StartJourneyCommand command) throws Throwable {

        String journeyId = command.getJourneyId();
        String journeyTypeId = command.getJourneyTypeId();

        JourneyStoreService store = JourneyStoreService.get();

        Journey journey = null;
        Object formInstance = null;

        JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);
        if (journeyContainer == null) {

            try {

                formInstance = store.createInstanceFromJourneyTypeId(journeyTypeId);

                if (formInstance == null) {
                    throw new Exception();
                }

                if (formInstance instanceof RemoteJourney) {
                    RemoteJourney remoteJourney = (RemoteJourney) formInstance;
                    mateuRemoteClient.startJourney(remoteJourney.getBaseUrl(),
                            remoteJourney.getJourneyTypeId(), journeyId);
                    return;
                }

                // we are passing the form instance to avoid creating a new form instance,
                // even though we already have the step definition id, and we could recreate it
                journey = new JourneyMapper().map(formInstance);

            } catch (Exception e) {
                e.printStackTrace();
                log.error("error on getUi", e);
                throw new NotFoundException("No class with name " + journeyTypeId + " found");
            }

            Step step = JourneyStoreService.get().getStepMapper().map(journeyContainer, getStepId(formInstance), formInstance);
            journey.setCurrentStepId(step.getId());
            journey.setCurrentStepDefinitionId(step.getType());
            store(journeyId, journeyTypeId, journey, step);

        } else {
            journeyContainer.reset();
        }

    }

    private String getStepId(Object formInstance) {
        if (formInstance instanceof Listing) return "list";
        return "form";
    }

    private void store(String journeyId, String journeyTypeId, Journey journey, Step step) {
        JourneyStoreService store = JourneyStoreService.get();
        JourneyContainer journeyContainer = JourneyContainer.builder()
                .journeyId(journeyId)
                .journeyTypeId(journeyTypeId)
                .journey(journey)
                .steps(Map.of(step.getId(), step))
                .initialStep(step)
                .build();
        store.save(journeyContainer);
    }

}
