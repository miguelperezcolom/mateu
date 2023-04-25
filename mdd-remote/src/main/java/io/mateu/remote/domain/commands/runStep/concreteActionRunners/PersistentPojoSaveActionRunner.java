package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PersistentPojoSaveActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;


    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof PersistentPojo && "save".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{
        ((PersistentPojo) viewInstance).save();

        Step initialStep = store.getInitialStep(journeyId);

        Step currentStep = store.getStep(journeyId, stepId);

        List<Destination> youMayBeInterestedIn = new ArrayList<>();
        Step detail = store.getStep(journeyId, currentStep.getPreviousStepId());
        if (detail != null) {
            youMayBeInterestedIn.add(new Destination(DestinationType.ActionId,
                    "Return to " + detail.getName() + " detail", detail.getId()));
        }

        Result whatToShow = new Result(ResultType.Success,
                "" + viewInstance.toString() + " has been saved", youMayBeInterestedIn,
                new Destination(DestinationType.ActionId,
                        "Return to " + initialStep.getName(), initialStep.getId()));
        String newStepId = "result_" + UUID.randomUUID().toString();
        store.setStep(journeyId, newStepId, whatToShow);
    }
}
