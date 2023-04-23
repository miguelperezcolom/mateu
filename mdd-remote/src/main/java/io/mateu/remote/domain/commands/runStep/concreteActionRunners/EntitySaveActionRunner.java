package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import jakarta.persistence.Entity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class EntitySaveActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance.getClass().isAnnotationPresent(Entity.class) && "save".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable {
        ReflectionHelper.newInstance(Merger.class).merge(viewInstance);

        Step initialStep = store.getInitialStep(journeyId);

        Result whatToShow = new Result(ResultType.Success,
                "" + viewInstance.toString() + " has been saved", List.of(),
                new Destination(DestinationType.ActionId, "Back to " + initialStep.getName(),
                        initialStep.getId()));
        String newStepId = "result_" + UUID.randomUUID().toString();
        store.setStep(journeyId, newStepId, whatToShow);
    }
}
