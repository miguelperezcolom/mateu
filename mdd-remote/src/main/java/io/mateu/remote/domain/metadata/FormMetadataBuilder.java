package io.mateu.remote.domain.metadata;

import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;

import javax.persistence.Entity;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FormMetadataBuilder extends AbstractMetadataBuilder {
    public Form build(Object uiInstance) {
        Form form = Form.builder()
                .title(getCaption(uiInstance))
                .subtitle(getSubtitle(uiInstance))
                .status(getStatus(uiInstance))
                .readOnly(uiInstance instanceof ReadOnlyPojo && !(uiInstance instanceof PersistentPojo))
                .badges(getBadges(uiInstance))
                .sections(getSections(uiInstance))
                .actions(getActions(uiInstance))
                .mainActions(getMainActions(uiInstance))
                .build();
        return form;
    }

    private String getSubtitle(Object uiInstance) {
        if (uiInstance instanceof HasSubtitle) {
            return ((HasSubtitle) uiInstance).getSubtitle();
        }
        return null;
    }

    private Status getStatus(Object uiInstance) {
        if (!(uiInstance instanceof HasStatus)) {
            return null;
        }
        HasStatus hasStatus = (HasStatus) uiInstance;
        if (hasStatus.getStatus() == null) return null;
        return new Status(mapStatusType(hasStatus.getStatus().getType()), hasStatus.getStatus().getMessage());
    }

    private StatusType mapStatusType(io.mateu.mdd.shared.data.StatusType type) {
        return StatusType.valueOf(type.toString());
    }

    private List<Badge> getBadges(Object uiInstance) {
        if (!(uiInstance instanceof HasBadges)) {
            return List.of();
        }
        return ((HasBadges) uiInstance).getBadges().stream().map(b -> new Badge(mapBadgeType(b.getType()), b.getMessage())).collect(Collectors.toList());
    }

    private BadgeType mapBadgeType(io.mateu.mdd.shared.data.BadgeType type) {
        return BadgeType.valueOf(type.toString());
    }

    private List<Action> getMainActions(Object uiInstance) {
        List<Method> allMethods = ReflectionHelper.getAllMethods(uiInstance.getClass());
        List<Action> actions = allMethods.stream()
                .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.MainAction.class))
                .map(m -> getAction(m))
                .collect(Collectors.toList());
        if (uiInstance instanceof ReadOnlyPojo || uiInstance instanceof PersistentPojo || uiInstance.getClass().isAnnotationPresent(Entity.class)) {
            Action action = Action.builder()
                    .id("cancel")
                    .caption("Cancel")
                    .type(ActionType.Secondary)
                    .build();
            actions.add(action);
        }
        if (uiInstance instanceof PersistentPojo || uiInstance.getClass().isAnnotationPresent(Entity.class)) {
            Action action = Action.builder()
                    .id("save")
                    .caption("Save")
                    .type(ActionType.Primary)
                    .build();
            actions.add(action);
        }
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
                section = Section.builder()
                        .caption(caption).readOnly(uiInstance instanceof ReadOnlyPojo
                        && !(uiInstance instanceof PersistentPojo))
                        .fieldGroups(new ArrayList<>()).build();
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




    private String getCaption(Object uiInstance) {

        if (uiInstance instanceof HasTitle) {
            return ((HasTitle) uiInstance).getTitle();
        }

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
            } else return Helper.capitalize(uiInstance.toString());
        } catch (NoSuchMethodException e) {
        }

        return prefix + uiInstance;
    }
}
