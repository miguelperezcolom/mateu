package io.mateu.remote.application;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Help;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ViewMapper {
    public View map(Object uiInstance) throws IOException {
        View view = new View();

        view.setMetadata(getMetadata(uiInstance));
        view.setData(getData(uiInstance));

        return view;
    }

    private Map<String, Object> getData(Object uiInstance) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data = Helper.fromJson(Helper.toJson(uiInstance));
        return data;
    }

    private ViewMetadata getMetadata(Object uiInstance) {
        ViewMetadata metadata;

        if (uiInstance instanceof RpcView) {
            metadata = new Crud();
        } else {
            metadata = getForm(uiInstance);
        }

        return metadata;
    }

    private Form getForm(Object uiInstance) {
        Form form = new Form();
        form.setCaption(getCaption(uiInstance));
        form.setSections(getSections(uiInstance));
        form.setActions(getActions(uiInstance));
        form.setMainActions(getMainActions(uiInstance));
        return form;
    }

    private List<Action> getMainActions(Object uiInstance) {
        List<Method> allMethods = ReflectionHelper.getAllMethods(uiInstance.getClass());
        List<Action> actions = allMethods.stream()
                .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.MainAction.class))
                .map(m -> getAction(m))
                .collect(Collectors.toList());
        return actions;
    }

    private Action getAction(Method m) {
        Action action = new Action();
        action.setId(m.getName());
        action.setCaption(ReflectionHelper.getCaption(m));
        action.setType(ActionType.Primary);
        return action;
    }

    private List<Action> getActions(Object uiInstance) {
        List<Method> allMethods = ReflectionHelper.getAllMethods(uiInstance.getClass());
        List<Action> actions = allMethods.stream()
                .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
                .map(m -> getAction(m))
                .collect(Collectors.toList());
        return actions;
    }

    private List<Section> getSections(Object uiInstance) {
        List<Section> sections = new ArrayList<>();
        Section section = null;
        FieldGroup fieldGroup = null;

        List<FieldInterfaced> allEditableFields = ReflectionHelper.getAllEditableFields(uiInstance.getClass());
        for (FieldInterfaced fieldInterfaced : allEditableFields) {
            if (section == null || fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.Section.class)) {
                section = new Section();
                if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.Section.class)) {
                    section.setCaption(fieldInterfaced.getAnnotation(io.mateu.mdd.shared.annotations.Section.class).value());
                } else {
                    section.setCaption("");
                }
                sections.add(section);
                fieldGroup = null;
            }
            if (fieldGroup == null || fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.FieldGroup.class)) {
                fieldGroup = new FieldGroup();
                if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.FieldGroup.class)) {
                    fieldGroup.setCaption(fieldInterfaced.getAnnotation(io.mateu.mdd.shared.annotations.FieldGroup.class).value());
                } else {
                    fieldGroup.setCaption("");
                }
                section.getFieldGroups().add(fieldGroup);
            }
            fieldGroup.getFields().add(getField(fieldInterfaced));
        }

        return sections;
    }

    private Field getField(FieldInterfaced fieldInterfaced) {
        Field field = new Field();
        field.setId(fieldInterfaced.getId());
        field.setCaption(ReflectionHelper.getCaption(fieldInterfaced));
        field.setDescription(getDescription(fieldInterfaced));
        field.setType(fieldInterfaced.getType().toString());
        addValidations(field, fieldInterfaced);
        return field;
    }

    private void addValidations(Field field, FieldInterfaced fieldInterfaced) {
        //todo: implement
    }

    private String getDescription(FieldInterfaced fieldInterfaced) {
        String description = null;
        if (fieldInterfaced.isAnnotationPresent(Help.class)) {
            description = fieldInterfaced.getAnnotation(Help.class).value();
        }
        return description;
    }

    private String getCaption(Object uiInstance) {
        Class<?> modelType = uiInstance.getClass();
        if (modelType.isAnnotationPresent(Caption.class)) {
            return modelType.getAnnotation(Caption.class).value();
        }
        String viewTitle = "";
        if (uiInstance != null && uiInstance instanceof ReadOnlyPojo) viewTitle = ((ReadOnlyPojo) uiInstance).getEntityName();
        if (uiInstance != null && uiInstance instanceof PersistentPojo) {
            viewTitle = ((PersistentPojo) uiInstance).getEntityName();
            if (((PersistentPojo) uiInstance).isNew()) return "New " + viewTitle;
        }
        String prefix = "";
        if (!"".equals(viewTitle)) prefix = viewTitle + " ";

        try {
            if (Object.class.equals(modelType.getMethod("toString").getDeclaringClass())) {
                return Helper.capitalize(modelType.getSimpleName());
            }
        } catch (NoSuchMethodException e) {
        }

        return prefix + uiInstance;
    }
}
