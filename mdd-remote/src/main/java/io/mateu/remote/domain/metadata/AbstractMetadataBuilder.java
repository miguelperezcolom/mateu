package io.mateu.remote.domain.metadata;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.data.ValuesListProvider;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Action;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractMetadataBuilder {

    protected Field getField(FieldInterfaced fieldInterfaced) {
        Field field = Field.builder()
                .id(fieldInterfaced.getId())
                .caption(ReflectionHelper.getCaption(fieldInterfaced))
                .placeholder(getPlaceholder(fieldInterfaced))
                .description(getDescription(fieldInterfaced))
                .type(mapFieldType(fieldInterfaced))
                .stereotype(mapStereotype(fieldInterfaced))
                .attributes(buildAttributes(fieldInterfaced))
                .build();
        addValidations(field, fieldInterfaced);
        return field;
    }

    private String getPlaceholder(FieldInterfaced fieldInterfaced) {
        if (fieldInterfaced.isAnnotationPresent(Placeholder.class)) {
            return fieldInterfaced.getAnnotation(Placeholder.class).value();
        }
        return null;
    }

    private List<Pair> buildAttributes(FieldInterfaced field) {
        List<Pair> attributes = new ArrayList<>();
        if (field.isAnnotationPresent(ItemsProvider.class)) {
            attributes.add(Pair.builder()
                            .key("itemprovider")
                            .value(field.getAnnotation(ItemsProvider.class).value().getName())
                    .build());
        }
        if (field.isAnnotationPresent(ValuesProvider.class)) {
            try {
                ValuesListProvider provider = (ValuesListProvider) ReflectionHelper.newInstance(field.getAnnotation(ValuesProvider.class).value());
                provider.getAll().forEach(v -> {
                    attributes.add(Pair.builder()
                            .key("choice")
                            .value(Value.builder()
                                    .key("" + v)
                                    .value(v)
                                    .build()
                            ).build());
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        if (isFile(field)) {
            attributes.add(Pair.builder()
                    .key("fileidprefix")
                    .value("mateuremoteistheremoteflavourofmateu")
                    .build());
            if (List.class.isAssignableFrom(field.getType()) || field.getType().isArray()) {
                attributes.add(Pair.builder()
                        .key("maxfiles")
                        .value(3)
                        .build());
            } else {
                attributes.add(Pair.builder()
                        .key("maxfiles")
                        .value(1)
                        .build());
            }
        }
        if (field.getType().isEnum()
                || (field.getType().isArray() && field.getType().getComponentType().isEnum())
                || (List.class.isAssignableFrom(field.getType()) && field.getGenericClass().isEnum())
        ) {
            Class enumType = field.getType();
            if (enumType.isArray()) enumType = enumType.getComponentType();
            if (List.class.isAssignableFrom(enumType)) enumType = field.getGenericClass();
            Method m = null;
            try {
                m = enumType.getMethod("value", null);
                for (Object enumConstant : enumType.getEnumConstants()) {
                    Object value = m.invoke(enumConstant, null);
                    attributes.add(Pair.builder()
                            .key("choice")
                            .value(Value.builder()
                                    .key(enumConstant.toString())
                                    .value(value)
                                    .build()
                            ).build());
                }
            } catch (Exception e) {
                for (Object enumConstant : enumType.getEnumConstants()) {
                    attributes.add(Pair.builder()
                            .key("choice")
                            .value(Value.builder()
                                    .key(enumConstant.toString())
                                    .value(enumConstant)
                                    .build()
                            ).build());
                }
            }
        }
        return attributes;
    }

    private boolean isFile(FieldInterfaced field) {
        return java.io.File.class.equals(field.getType())
                || java.io.File[].class.equals(field.getType())
                || java.io.File.class.equals(ReflectionHelper.getGenericClass(field, List.class, "E"))
                || field.isAnnotationPresent(File.class);
    }

    private String mapStereotype(FieldInterfaced field) {
        if (field.isAnnotationPresent(UseRadioButtons.class)) {
            return "radiobuttons";
        }
        if (field.isAnnotationPresent(Toggle.class)) {
            return "toggle";
        }
        if (field.getType().isEnum()) {
            return "combobox";
        }
        if (field.isAnnotationPresent(ReadOnly.class) || field.isAnnotationPresent(Output.class)
        || (field.isAnnotationPresent(Id.class))) {
            return "readonly";
        }
        if (field.isAnnotationPresent(TextArea.class)) {
            return "textarea";
        }
        if (field.isAnnotationPresent(ItemsProvider.class)) {
            return "externalref";
        }
        if (isFile(field)) {
            return "file";
        }
        if (field.isAnnotationPresent(ValuesProvider.class)) {
            return "closedlist";
        }
        return "input";
    }

    private String mapFieldType(FieldInterfaced field) {
        Class<?> type = field.getType();
        if (type.isEnum()) {
            return "enum";
        }
        if (String.class.equals(type)) {
            return "string";
        }
        if (String[].class.equals(type)) {
            return "string[]";
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
        if (java.io.File.class.equals(type)) {
            return "file";
        }
        if (type.isArray()) {
            if (type.getComponentType().isEnum()) {
                return "enum[]";
            }
        }
        if (List.class.isAssignableFrom(type)) {
            String value = field.getGenericClass().getSimpleName().toLowerCase();
            if (Integer.class.equals(field.getGenericClass())) {
                value = "int";
            }
            if (ExternalReference.class.equals(field.getGenericClass())) {
                value = ExternalReference.class.getSimpleName();
            }
            if (field.getGenericClass().isEnum()) {
                value = "enum";
            }
            return value + "[]";
        }
        return type.getSimpleName();
    }

    private void addValidations(Field field, FieldInterfaced fieldInterfaced) {
        List<Validation> validations = new ArrayList<>();
        //todo: añadir otros tipos de validación, y mensaje de error
        if (fieldInterfaced.isAnnotationPresent(NotEmpty.class)
                || fieldInterfaced.isAnnotationPresent(NotNull.class)
                || fieldInterfaced.isAnnotationPresent(NotBlank.class)
        ) {
            validations.add(Validation.builder()
                            .type(ValidationType.NotEmpty)
                            .data(null)
                    .build());
        }
        field.setValidations(validations);
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

    protected List<Action> getActions(String stepId, String listId, Object uiInstance) {
        List<Method> allMethods = ReflectionHelper.getAllMethods(uiInstance.getClass());
        List<Action> actions = allMethods.stream()
                .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
                .map(m -> getAction(m))
                .collect(Collectors.toList());
        if (!Strings.isNullOrEmpty(listId)) actions.forEach(a -> a.setId("__list__" + listId + "__" + a.getId()));
        if (uiInstance instanceof RpcCrudView) {
            RpcCrudView rpcCrudView = (RpcCrudView) uiInstance;
            if (rpcCrudView.isAddEnabled()) {
                Action action = Action.builder()
                        .id("__list__" + listId + "__new")
                        .caption("New")
                        .type(ActionType.Primary)
                        .build();
                actions.add(action);
            }
            if (rpcCrudView.isDeleteEnabled()) {
                Action action = Action.builder()
                        .id("__list__" + listId + "__delete")
                        .caption("Delete")
                        .type(ActionType.Primary)
                        .build();
                actions.add(action);
            }
        }
        if (("view".equals(stepId) && uiInstance.getClass().isAnnotationPresent(Entity.class))
        || (uiInstance instanceof ReadOnlyPojo && !(uiInstance instanceof PersistentPojo))) {
            Action action = Action.builder()
                    .id("edit")
                    .caption("Edit")
                    .type(ActionType.Primary)
                    .build();
            actions.add(action);
        }
        return actions;
    }

    protected String getType(FieldInterfaced fieldInterfaced) {
        return mapFieldType(fieldInterfaced);
    }


}
