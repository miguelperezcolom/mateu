package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.data.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.commands.runStep.ActualValueExtractor;
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
public class MethodParametersEditorRunActionRunner extends AbstractActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Autowired
    private ActualValueExtractor actualValueExtractor;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof MethodParametersEditor && "run".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{
        MethodParametersEditor methodParametersEditor = (MethodParametersEditor) viewInstance;

        Step initialStep = store.getStep(journeyId, methodParametersEditor.getInitialStep());

        Object object = Serializer.fromMap(methodParametersEditor.getData(),
                methodParametersEditor.getType());

        Method m = ReflectionHelper.getMethod(methodParametersEditor.getType(), methodParametersEditor.getMethodId());
        List<Object> values = new ArrayList<>();
        for (int i = 0; i < m.getParameterCount(); i++) {
            values.add(actualValueExtractor.getActualValue(m.getParameterTypes()[i], data.get("param_" + i)));
        }
        Object result = m.invoke(object, values.toArray());

        store.setStep(journeyId, initialStep.getId(), object);

        Object whatToShow = result;
        if (!void.class.equals(m.getReturnType())) {
            if (whatToShow instanceof Result) {
                addBackDestination((Result) whatToShow,
                        store.getInitialStep(journeyId));
            }
            String newStepId = "result_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, whatToShow);
        } else {
            store.backToStep(journeyId, initialStep.getId()); // will save the step
        }
    }
}