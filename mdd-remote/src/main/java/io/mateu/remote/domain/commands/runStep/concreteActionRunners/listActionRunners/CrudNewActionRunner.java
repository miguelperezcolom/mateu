package io.mateu.remote.domain.commands.runStep.concreteActionRunners.listActionRunners;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.remote.domain.commands.runStep.concreteActionRunners.ListActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class CrudNewActionRunner implements ListActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Crud crud, String actionId) {
        return "new".equals(actionId);
    }

    @Override
    public void run(Crud crud, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable {

        try {

            Object editor = crud.getNewRecordForm();

            if (editor == null) {
                throw new Exception("Crud onNew and onEdit returned null");
            }

            String newStepId = "new_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, editor);

        } catch (Throwable e) {
            throw new Exception("Crud onNew thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }

    }
}