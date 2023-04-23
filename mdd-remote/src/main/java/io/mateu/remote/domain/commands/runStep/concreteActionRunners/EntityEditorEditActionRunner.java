package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EntityEditorEditActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof EntityEditor && "edit".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data) throws Throwable {
        store.setStep(journeyId, "edit", viewInstance);
    }
}
