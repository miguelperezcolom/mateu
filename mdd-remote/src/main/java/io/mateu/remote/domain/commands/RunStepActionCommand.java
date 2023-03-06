package io.mateu.remote.domain.commands;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.domain.StepMapper;
import lombok.Builder;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Builder
public class RunStepActionCommand {

    private String journeyId;

    private String stepId;

    private String actionId;

    private Map<String, Object> data;

    public void run() throws Exception {

        Object viewInstance = JourneyStoreAccessor.get().getViewInstance(stepId);

        data.entrySet().forEach(e -> {
            try {
                Object v = null;
                if (e.getValue() != null) {
                    Field f = viewInstance.getClass().getDeclaredField(e.getKey());
                    if (f.getType().isAssignableFrom(e.getValue().getClass())) {
                        v = e.getValue();
                    } else {
                        if (long.class.equals(f.getType())) {
                            v = Long.valueOf((String) e.getValue());
                        } else if (int.class.equals(f.getType())) {
                            v = Integer.valueOf((String) e.getValue());
                        }
                    }
                }
                ReflectionHelper.setValue(e.getKey(), viewInstance, v);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });

        Map<String, Method> actions = ReflectionHelper.getAllMethods(viewInstance.getClass()).stream()
                .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
                .collect(Collectors.toMap(m -> m.getName(), m -> m));


        if (actions.containsKey(actionId)) {

            Method m = actions.get(actionId);

            Object result = m.invoke(viewInstance);

            JourneyStoreAccessor.get().putStep(stepId, new StepMapper().map(viewInstance));

        } else {
            throw new Exception("Unkonwn action " + actionId);
        }

    }
}
