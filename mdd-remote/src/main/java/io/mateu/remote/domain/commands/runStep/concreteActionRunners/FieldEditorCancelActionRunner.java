package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FieldEditorCancelActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof FieldEditor && "cancel".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{
        FieldEditor fieldEditor = (FieldEditor) viewInstance;
        store.backToStep(journeyId, fieldEditor.getInitialStep());
    }
}
