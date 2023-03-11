package io.mateu.remote.domain;

import io.mateu.mdd.shared.annotations.Help;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.TextArea;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Action;
import io.mateu.remote.dtos.ActionType;
import io.mateu.remote.dtos.Field;

import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractMetadataBuilder {

    protected Field getField(FieldInterfaced fieldInterfaced) {
        Field field = Field.builder()
                .id(fieldInterfaced.getId())
                .caption(ReflectionHelper.getCaption(fieldInterfaced))
                .description(getDescription(fieldInterfaced))
                .type(mapFieldType(fieldInterfaced.getType()))
                .stereotype(mapStereotype(fieldInterfaced))
                .build();
        addValidations(field, fieldInterfaced);
        return field;
    }

    private String mapStereotype(FieldInterfaced field) {
        if (field.isAnnotationPresent(ReadOnly.class) || field.isAnnotationPresent(Output.class)) {
            return "readonly";
        }
        if (field.isAnnotationPresent(TextArea.class)) {
            return "textarea";
        }
        return "input";
    }

    private String mapFieldType(Class<?> type) {
        if (String.class.equals(type)) {
            return "string";
        }
        if (LocalDate.class.equals(type)) {
            return "date";
        }
        if (LocalDateTime.class.equals(type)) {
            return "datetime";
        }
        if (LocalTime.class.equals(type)) {
            return "time";
        }
        if (Integer.class.equals(type)) {
            return "int";
        }
        if (Long.class.equals(type) || Double.class.equals(type)) {
            return type.getSimpleName().toLowerCase();
        }
        return type.getSimpleName();
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
