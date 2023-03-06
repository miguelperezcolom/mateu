package io.mateu.remote.domain.commands;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.JourneyMapper;
import io.mateu.remote.domain.JourneyStore;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.domain.StepMapper;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Builder
@Slf4j
public class StartJourneyCommand {

    private String journeyTypeId;

    private String journeyId;

    public void run() throws Exception {
        JourneyStore store = JourneyStoreAccessor.get();

        Journey journey = store.getJourneyPerType(journeyTypeId);
        Object formInstance = store.getFormInstancePerType(journeyTypeId);

        if (journey == null) {
            try {
                Class formClass = Class.forName(journeyTypeId);
                formInstance = ReflectionHelper.newInstance(formClass);

                if (formInstance == null) {
                    throw new Exception();
                }

                // we are passing the form instance to avoid creating a new form instance,
                // even though we already have the step definition id, and we could recreate it
                journey = new JourneyMapper().map(formInstance);

            } catch (Exception e) {
                e.printStackTrace();
                log.error("error on getUi", e);
                throw new NotFoundException("No class with name " + journeyTypeId + " found");
            }

        }

        createStep(store, journey, formInstance);

        store.putJourney(journeyId, journey);

    }

    private void createStep(JourneyStore store, Journey journey, Object formInstance) throws IOException {
        Step step = new StepMapper().map(formInstance);
        store.putStep(journey.getCurrentStepId(), step);
        store.putViewInstance(journey.getCurrentStepId(), formInstance);
    }
}
