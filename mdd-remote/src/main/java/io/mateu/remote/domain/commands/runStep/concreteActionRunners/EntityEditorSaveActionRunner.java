package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class EntityEditorSaveActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof EntityEditor && "save".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data) throws Throwable {
        EntityEditor entityEditor = (EntityEditor) viewInstance;
        Merger merger = store.getApplicationContext().getBean(Merger.class);
        merger.mergeAndCommit(data, entityEditor.getEntityClass());
        data.remove("__entityClassName__");
        entityEditor.setData(data);
        store.setStep(journeyId, stepId, entityEditor);

        Step initialStep = store.getInitialStep(journeyId);

        Result whatToShow = new Result(ResultType.Success,
                "" + viewInstance.toString() + " has been saved", List.of(),
                new Destination(DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()));
        String newStepId = "result_" + UUID.randomUUID().toString();
        store.setStep(journeyId, newStepId, whatToShow);
    }
}