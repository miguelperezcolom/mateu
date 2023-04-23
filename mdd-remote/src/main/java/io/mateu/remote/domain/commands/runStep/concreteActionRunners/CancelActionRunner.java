package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import jakarta.persistence.Entity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CancelActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return (viewInstance instanceof ReadOnlyPojo
                || viewInstance instanceof PersistentPojo
                || viewInstance instanceof EntityEditor
                || viewInstance.getClass().isAnnotationPresent(Entity.class))
                && "cancel".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data) throws Exception {
        store.backToStep(journeyId, store.getInitialStep(journeyId).getId());
    }
}
