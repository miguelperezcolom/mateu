package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.data.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Serializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MethodParametersEditorCancelActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;


    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof MethodParametersEditor && "cancel".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{
        MethodParametersEditor methodParametersEditor = (MethodParametersEditor) viewInstance;
        store.backToStep(journeyId, methodParametersEditor.getInitialStep());
    }
}
