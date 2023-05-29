package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FieldEditorActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return actionId.startsWith("__editfield__");
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{
        if (viewInstance instanceof FieldEditor) {
            store.setStep(journeyId, actionId, viewInstance);
            return;
        }
        String fieldId = actionId.substring("__editfield__".length());

        FieldInterfaced field = ReflectionHelper.getFieldByName(viewInstance.getClass(), fieldId);

        Object targetValue = ReflectionHelper.getValue(field, viewInstance);

        if (targetValue == null) {
            targetValue = ReflectionHelper.newInstance(field.getType());
        }

        store.setStep(journeyId, actionId, new FieldEditor(targetValue,
                fieldId,
                store.getCurrentStep(journeyId).getId()));
    }
}
