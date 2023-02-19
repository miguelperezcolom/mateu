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

        View view = View.builder()
                .metadata(getMetadata(uiInstance))
                .data(getData(uiInstance))
                .build();

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
        Form form = Form.builder()
                .title(getCaption(uiInstance))
                .sections(getSections(uiInstance))
                .actions(getActions(uiInstance))
                .mainActions(getMainActions(uiInstance))
        .build();
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
        Action action = Action.builder()
                .id(m.getName())
                .caption(ReflectionHelper.getCaption(m))
                .type(ActionType.Primary)
                .build();
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
                String caption = "";
                if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.Section.class)) {
                    caption = fieldInterfaced.getAnnotation(io.mateu.mdd.shared.annotations.Section.class).value();
                }
                section = Section.builder().caption(caption).fieldGroups(new ArrayList<>()).build();
                sections.add(section);
                fieldGroup = null;
            }
            if (fieldGroup == null || fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.FieldGroup.class)) {
                String caption = "";
                if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.FieldGroup.class)) {
                    caption = fieldInterfaced.getAnnotation(io.mateu.mdd.shared.annotations.FieldGroup.class).value();
                }
                fieldGroup = FieldGroup.builder().caption(caption).fields(new ArrayList<>()).build();
                section.getFieldGroups().add(fieldGroup);
            }
            fieldGroup.getFields().add(getField(fieldInterfaced));
        }

        return sections;
    }

    private Field getField(FieldInterfaced fieldInterfaced) {
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
