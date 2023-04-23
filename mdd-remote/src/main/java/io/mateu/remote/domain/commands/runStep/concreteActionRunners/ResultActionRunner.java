package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.data.Result;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ResultActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof Result;
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{
        Step step = store.getStep(journeyId, actionId);
        store.getJourney(journeyId).setCurrentStepId(step.getId());
        store.getJourney(journeyId).setCurrentStepDefinitionId(step.getType());
    }
}
