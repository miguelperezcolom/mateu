package io.mateu.remote.domain.commands;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.mappers.JourneyMapper;
import io.mateu.remote.domain.mappers.StepMapper;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.domain.store.MenuToBeanMapping;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Builder
@Slf4j
public class StartJourneyCommand {

    private String journeyTypeId;

    private String journeyId;

    public void run() throws Exception {
        JourneyStoreService store = JourneyStoreService.get();

        Journey journey = null;
        Object formInstance = null;

        JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);
        if (journeyContainer == null) {

            try {

                formInstance = store.createInstanceFromJourneyId(journeyId);

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

            Step step = new StepMapper().map(getStepId(formInstance), formInstance);
            journey.setCurrentStepId(step.getId());
            journey.setCurrentStepDefinitionId(step.getType());
            store(journeyId, journeyTypeId, journey, step);

        } else {
            journeyContainer.reset();
        }

    }

    private String getStepId(Object formInstance) {
        if (formInstance instanceof RpcView) return "list";
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
