package io.mateu.remote.domain.commands;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.domain.StepMapper;
import lombok.Builder;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

        data.entrySet().forEach(entry -> {
            try {
                Object actualValue = getActualValue(entry, viewInstance);
                ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
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

    private Object getActualValue(Map.Entry<String, Object> entry, Object viewInstance) throws NoSuchFieldException {
        Object targetValue = entry.getValue();
        if (entry.getValue() != null) {
            Field f = viewInstance.getClass().getDeclaredField(entry.getKey());
            if (!f.getType().isAssignableFrom(entry.getValue().getClass())) {
                if (entry.getValue() instanceof String) {
                    if (long.class.equals(f.getType())) {
                        targetValue = Long.valueOf((String) entry.getValue());
                    } else if (int.class.equals(f.getType())) {
                        targetValue = Integer.valueOf((String) entry.getValue());
                    } else if (LocalDate.class.equals(f.getType())) {
                        targetValue = LocalDate.parse((String) entry.getValue());
                    } else if (LocalDateTime.class.equals(f.getType())) {
                        targetValue = LocalDateTime.parse((String) entry.getValue());
                    } else if (LocalTime.class.equals(f.getType())) {
                        targetValue = LocalTime.parse((String) entry.getValue());
                    }
                }
            }
        }
        return targetValue;
    }
}
