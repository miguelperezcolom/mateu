package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.editors.ObjectEditor;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.HashMap;
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
        return getActions(getActualInstance(viewInstance, Map.of())).containsKey(actionId);
    }

    private Object getActualInstance(Object viewInstance, Map<String, Object> data) {
        if (viewInstance instanceof EntityEditor) {
            try {
                EntityEditor entityEditor = ((EntityEditor) viewInstance);
                Map<String, Object> mergedData = new HashMap<>();
                mergedData.putAll(entityEditor.getData());
                mergedData.putAll(data);
                return merger.loadEntity(mergedData, entityEditor.getEntityClass());
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }
        if (viewInstance instanceof ObjectEditor) {
            try {
                ObjectEditor objectEditor = ((ObjectEditor) viewInstance);
                Object object = ReflectionHelper.newInstance(objectEditor.getType());
                Map<String, Object> mergedData = new HashMap<>();
                mergedData.putAll(objectEditor.getData());
                mergedData.putAll(data);
                Object filled = Helper.fromJson(Helper.toJson(mergedData), objectEditor.getType());
                ReflectionHelper.copy(filled, object);

                return object;
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }
        return viewInstance;
    }

    private Map<Object, Method> getActions(Object viewInstance) {
        return ReflectionHelper.getAllMethods(getActualInstance(viewInstance, Map.of()).getClass()).stream()
                .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
                .collect(Collectors.toMap(m -> m.getName(), m -> m));
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest)
            throws Throwable {

        Object actualViewInstance = getActualInstance(viewInstance, data);

        Method m = getActions(actualViewInstance).get(actionId);

        runMethod(actualViewInstance, m, journeyId, stepId, actionId, data, serverHttpRequest);
    }

    protected void runMethod(Object actualViewInstance, Method m,  String journeyId, String stepId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest) throws Throwable {
        //todo: inject paramneters (ServerHttpRequest, selection for jpacrud)
        if (needsParameters(m)) {

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

                Object result = m.invoke(actualViewInstance, injectParameters(m, serverHttpRequest));

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

    private Object[] injectParameters(Method m, ServerHttpRequest serverHttpRequest) {
        Object[] values = new Object[m.getParameterCount()];
        for (int i = 0; i < m.getParameters().length; i++) {
            Parameter parameter = m.getParameters()[i];
            Object value = null;
            if (ServerHttpRequest.class.equals(parameter.getType())) {
                value = serverHttpRequest;
            }
            values[i] = value;
        }
        return values;
    }

    private boolean needsParameters(Method m) {
        if (m.getParameterCount() == 0) return false;
        boolean anyNotInjected = false;
        for (Parameter parameter : m.getParameters()) {
            if (parameter.getType().equals(ServerHttpRequest.class)) {
                continue;
            }
            anyNotInjected = true;
        }
        return anyNotInjected;
    }
}
