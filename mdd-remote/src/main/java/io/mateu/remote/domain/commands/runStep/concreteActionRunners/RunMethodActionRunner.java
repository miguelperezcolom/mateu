package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RunMethodActionRunner extends AbstractActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return getActions(viewInstance).containsKey(actionId);
    }

    private Map<Object, Method> getActions(Object viewInstance) {
        return ReflectionHelper.getAllMethods(viewInstance.getClass()).stream()
                .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
                .collect(Collectors.toMap(m -> m.getName(), m -> m));
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{

        Method m = getActions(viewInstance).get(actionId);

        if (m.getParameterCount() > 0) {

            store.setStep(journeyId, actionId, new MethodParametersEditor(viewInstance,
                    m.getName(),
                    store.getCurrentStep(journeyId).getId()));

        } else {

            try {
                Object result = m.invoke(viewInstance);

                store.updateStep(journeyId, viewInstance);

                Object whatToShow = result;
                if (!void.class.equals(m.getReturnType())) {
                    if (whatToShow instanceof Result) {
                        addBackDestination((Result) whatToShow,
                                store.getInitialStep(journeyId));
                    }
                    String newStepId = "result_" + UUID.randomUUID().toString();
                    store.setStep(journeyId, newStepId, whatToShow);
                }

            } catch (InvocationTargetException ex) {
                Throwable targetException = ex.getTargetException();
                System.out.println("" + targetException.getClass().getSimpleName() +
                        ": " + targetException.getMessage());
                throw targetException;
            }

        }
    }
}
