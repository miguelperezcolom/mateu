package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RunMethodActionRunner extends AbstractActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Autowired
    Merger merger;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return getActions(getActualInstance(viewInstance)).containsKey(actionId);
    }

    private Object getActualInstance(Object viewInstance) {
        if (viewInstance instanceof EntityEditor) {
            try {
                EntityEditor entityEditor = ((EntityEditor) viewInstance);
                return merger.loadEntity(entityEditor.getData(), entityEditor.getEntityClass());
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }
        return viewInstance;
    }

    private Map<Object, Method> getActions(Object viewInstance) {
        return ReflectionHelper.getAllMethods(viewInstance.getClass()).stream()
                .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
                .collect(Collectors.toMap(m -> m.getName(), m -> m));
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest)
            throws Throwable {

        Object actualViewInstance = getActualInstance(viewInstance);

        Method m = getActions(actualViewInstance).get(actionId);

        runMethod(actualViewInstance, m, journeyId, stepId, actionId, data, serverHttpRequest);
    }

    protected void runMethod(Object actualViewInstance, Method m,  String journeyId, String stepId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest) throws Throwable {
        //todo: inject paramneters (ServerHttpRequest, selection for jpacrud)
        if (m.getParameterCount() > 0) {

            if (Modifier.isStatic(m.getModifiers())) {

                store.setStep(journeyId, actionId, new MethodParametersEditor(m.getDeclaringClass(),
                        m.getName(),
                        store.getCurrentStep(journeyId).getId(), data), serverHttpRequest);

            } else {

                store.setStep(journeyId, actionId, new MethodParametersEditor(actualViewInstance,
                        m.getName(),
                        store.getCurrentStep(journeyId).getId()), serverHttpRequest);

            }

        } else {

            try {
                Object result = m.invoke(actualViewInstance);

                if (actualViewInstance != null) {
                    store.updateStep(journeyId, actualViewInstance, serverHttpRequest);
                }

                Object whatToShow = result;
                if (!void.class.equals(m.getReturnType())) {
                    if (whatToShow instanceof Result) {
                        addBackDestination((Result) whatToShow,
                                store.getInitialStep(journeyId));
                    }
                    String newStepId = "result_" + UUID.randomUUID().toString();
                    store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);
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
