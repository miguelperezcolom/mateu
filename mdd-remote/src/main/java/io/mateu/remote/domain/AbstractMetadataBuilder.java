package io.mateu.remote.domain;

import io.mateu.mdd.shared.annotations.Help;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Action;
import io.mateu.remote.dtos.ActionType;
import io.mateu.remote.dtos.Field;

import java.lang.reflect.Method;
import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractMetadataBuilder {

    protected Field getField(FieldInterfaced fieldInterfaced) {
        Field field = Field.builder()
                .id(fieldInterfaced.getId())
                .caption(ReflectionHelper.getCaption(fieldInterfaced))
                .description(getDescription(fieldInterfaced))
                .type(fieldInterfaced.getType().toString())
                .build();
        addValidations(field, fieldInterfaced);
        return field;
    }

    private void addValidations(Field field, FieldInterfaced fieldInterfaced) {
        //todo: implement
        field.setValidations(List.of());
    }

    private String getDescription(FieldInterfaced fieldInterfaced) {
        String description = null;
        if (fieldInterfaced.isAnnotationPresent(Help.class)) {
            description = fieldInterfaced.getAnnotation(Help.class).value();
        }
        return description;
    }

    protected Action getAction(Method m) {
        Action action = Action.builder()
                .id(m.getName())
                .caption(ReflectionHelper.getCaption(m))
                .type(ActionType.Primary)
                .build();
        return action;
    }

    protected List<Action> getActions(Object uiInstance) {
        List<Method> allMethods = ReflectionHelper.getAllMethods(uiInstance.getClass());
        List<Action> actions = allMethods.stream()
                .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
                .map(m -> getAction(m))
                .collect(Collectors.toList());
        return actions;
    }

    protected String getType(FieldInterfaced fieldInterfaced) {
        return fieldInterfaced.getType().getName();
    }


}
