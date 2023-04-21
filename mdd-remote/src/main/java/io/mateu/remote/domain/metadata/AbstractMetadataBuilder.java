package io.mateu.remote.domain.metadata;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.data.ValuesListProvider;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Action;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.lang.reflect.InvocationTargetException;
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
                .classes(getClasNames(fieldInterfaced))
                .type(mapFieldType(fieldInterfaced))
                .stereotype(mapStereotype(fieldInterfaced))
                .attributes(buildAttributes(fieldInterfaced))
                .build();
        addValidations(field, fieldInterfaced);
        return field;
    }

    private String getClasNames(FieldInterfaced fieldInterfaced) {
        if (fieldInterfaced.isAnnotationPresent(StyleClassNames.class)) {
            return String.join(" ", fieldInterfaced.getAnnotation(StyleClassNames.class).value());
        }
        return null;
    }

    private String getPlaceholder(FieldInterfaced fieldInterfaced) {
        if (fieldInterfaced.isAnnotationPresent(Placeholder.class)) {
            return fieldInterfaced.getAnnotation(Placeholder.class).value();
        }
        return null;
    }

    private List<Pair> buildAttributes(FieldInterfaced field) {
        List<Pair> attributes = new ArrayList<>();
        if (field.isAnnotationPresent(Width.class)) {
            attributes.add(Pair.builder()
                            .key("width")
                            .value(field.getAnnotation(Width.class).value())
                    .build());
        }
        if (field.isAnnotationPresent(ItemsProvider.class)) {
            attributes.add(Pair.builder()
                            .key("itemprovider")
                            .value(field.getAnnotation(ItemsProvider.class).value().getName())
                    .build());
        }
        if (field.isAnnotationPresent(ManyToOne.class)) {
            attributes.add(Pair.builder()
                    .key("itemprovider")
                    .value(field.getType().getName())
                    .build());
        }
        if (field.isAnnotationPresent(OneToMany.class)) {
            if (field.isAnnotationPresent(UseChips.class)) {
                attributes.add(Pair.builder()
                        .key("itemprovider")
                        .value(field.getGenericClass().getName())
                        .build());
            }
            if (field.isAnnotationPresent(UseCheckboxes.class)) {
                attributes.add(Pair.builder()
                        .key("itemprovider")
                        .value(field.getGenericClass().getName())
                        .build());
            }
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
        if (field.isAnnotationPresent(CustomElement.class)) {
            return "custom:" + field.getAnnotation(CustomElement.class).value();
        }
        if (field.isAnnotationPresent(RawContent.class)) {
            return "rawcontent";
        }
        if (field.isAnnotationPresent(UseRadioButtons.class)) {
            return "radiobuttons";
        }
        if (field.isAnnotationPresent(Toggle.class)) {
            return "toggle";
        }
        if (field.getType().isEnum()) {
            return "combobox";
        }
        if (field.isAnnotationPresent(ReadOnly.class) || field.isAnnotationPresent(Output.class)) {
            return "readonly";
        }
        if (field.isAnnotationPresent(GeneratedValue.class)) {
            return "readonly";
        }
        if (field.isAnnotationPresent(Id.class)) {
            Object instance = null;
            try {
                instance = ReflectionHelper.newInstance(field.getDeclaringClass());
                Object initialValue = ReflectionHelper.getValue(field, instance);
                if (initialValue != null) {
                    return "readonly";
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        if (field.isAnnotationPresent(TextArea.class)) {
            return "textarea";
        }
        if (field.isAnnotationPresent(ItemsProvider.class)) {
            return "externalref";
        }
        if (field.isAnnotationPresent(ManyToOne.class)) {
            return "externalref";
        }
        if (field.isAnnotationPresent(UseChips.class)) {
            return "externalref";
        }
        if (isFile(field)) {
            return "file";
        }
        if (field.isAnnotationPresent(ValuesProvider.class)) {
            return "closedlist";
        }
        if (field.isAnnotationPresent(UseCheckboxes.class)) {
            return "externalref-checkboxes";
        }
        if (field.getType().isAnnotationPresent(Element.class)) {
            return "element:" + field.getType().getAnnotation(Element.class).value();
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
        if (Double.class.equals(type)) {
            return "double";
        }
        if (Boolean.class.equals(type)) {
            return "boolean";
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
        if (field.isAnnotationPresent(OneToMany.class)) {
            if (field.isAnnotationPresent(UseChips.class)) {
                return ExternalReference.class.getSimpleName() + "[]";
            }
            if (field.isAnnotationPresent(UseCheckboxes.class)) {
                return ExternalReference.class.getSimpleName() + "[]";
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
        if (field.isAnnotationPresent(ManyToOne.class)) {
            return ExternalReference.class.getSimpleName();
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
                .validationRequired(getValidationRequired(m))
                .confirmationRequired(getConfirmationRequired(m))
                .confirmationTexts(getConfirmationTexts(m))
                .build();
        return action;
    }

    private ConfirmationTexts getConfirmationTexts(Method m) {
        if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
            io.mateu.mdd.shared.annotations.Action action = m
                    .getAnnotation(io.mateu.mdd.shared.annotations.Action.class);
            return ConfirmationTexts.builder()
                    .title(getConfirmationTitle(action.confirmationTitle(), m))
                    .message(action.confirmationMessage())
                    .action(getConfirmationAction(action.confirmationAction(), m))
                    .build();
        }
        if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.MainAction.class)) {
            io.mateu.mdd.shared.annotations.MainAction action = m
                    .getAnnotation(io.mateu.mdd.shared.annotations.MainAction.class);
            return ConfirmationTexts.builder()
                    .title(getConfirmationTitle(action.confirmationTitle(), m))
                    .message(action.confirmationMessage())
                    .action(getConfirmationAction(action.confirmationAction(), m))
                    .build();
        }
        return null;
    }

    private String getConfirmationAction(String action, Method m) {
        if (Strings.isNullOrEmpty(action)) {
            return ReflectionHelper.getCaption(m);
        }
        return action;
    }

    private String getConfirmationTitle(String title, Method m) {
        if (Strings.isNullOrEmpty(title)) {
            return "Please confirm";
        }
        return title;
    }

    private boolean getConfirmationRequired(Method m) {
        if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
            return !Strings.isNullOrEmpty(m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class)
                    .confirmationMessage());
        }
        if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.MainAction.class)) {
            return !Strings.isNullOrEmpty(m.getAnnotation(io.mateu.mdd.shared.annotations.MainAction.class)
                    .confirmationMessage());
        }
        return false;
    }

    private boolean getValidationRequired(Method m) {
        if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
            return m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).validateBefore();
        }
        if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.MainAction.class)) {
            return m.getAnnotation(io.mateu.mdd.shared.annotations.MainAction.class).validateBefore();
        }
        return true;
    }

    protected List<Action> getActions(String stepId, String listId, Object uiInstance) {
        List<Method> allMethods = ReflectionHelper.getAllMethods(uiInstance.getClass());
        List<Action> actions = allMethods.stream()
                .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
                .map(m -> getAction(m))
                .collect(Collectors.toList());
        if (!Strings.isNullOrEmpty(listId)) actions.forEach(a -> a.setId("__list__" + listId + "__" + a.getId()));
        if (canAdd(uiInstance)) {
            Action action = Action.builder()
                    .id("__list__" + listId + "__new")
                    .caption("New")
                    .type(ActionType.Primary)
                    .build();
            actions.add(action);
        }
        if (canDelete(uiInstance)) {
            Action action = Action.builder()
                    .id("__list__" + listId + "__delete")
                    .caption("Delete")
                    .type(ActionType.Primary)
                    .confirmationRequired(true)
                    .confirmationTexts(ConfirmationTexts.builder()
                            .title("Please confirm")
                            .message("Are you sure you want to delete the selected rows")
                            .action("Yes, delete them")
                            .build())
                    .build();
            actions.add(action);
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

    private boolean canAdd(Object uiInstance) {
        if (uiInstance instanceof Crud) {
            return ReflectionHelper.isOverridden(uiInstance, "getNewRecordForm");
        }
        if (uiInstance instanceof RpcCrudViewExtended) {
            return ((RpcCrudViewExtended) uiInstance).isAddEnabled();
        }
        return false;
    }

    private boolean canDelete(Object uiInstance) {
        if (uiInstance instanceof Crud) {
            return ReflectionHelper.isOverridden(uiInstance, "delete");
        }
        if (uiInstance instanceof RpcCrudViewExtended) {
            return ((RpcCrudViewExtended) uiInstance).isDeleteEnabled();
        }
        return false;
    }

    protected String getType(FieldInterfaced fieldInterfaced) {
        return mapFieldType(fieldInterfaced);
    }


}
