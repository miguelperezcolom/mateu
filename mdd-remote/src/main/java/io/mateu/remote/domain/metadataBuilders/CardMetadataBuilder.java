package io.mateu.remote.domain.metadataBuilders;

import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.UseCheckboxes;
import io.mateu.mdd.shared.annotations.UseChips;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CardMetadataBuilder {

    @Autowired
    FieldMetadataBuilder fieldMetadataBuilder;

    //todo: this builder is based on reflection. Consider adding a dynamic one and cache results
    public Card build(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
        Card card = Card.builder()
                .title(getCaption(uiInstance))
                .subtitle(getSubtitle(uiInstance))
                .fieldGroups(getFieldGroups(stepId, uiInstance, slotFields))
                .build();
        return card;
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

    private List<FieldGroup> getFieldGroups(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
        List<FieldGroup> fieldGroups = new ArrayList<>();
        FieldGroup fieldGroup = null;
        FieldGroupLine fieldGroupLine = null;

        List<FieldInterfaced> allEditableFields = ReflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
                .filter(f -> !f.isAnnotationPresent(OneToMany.class)
                        || f.isAnnotationPresent(UseCheckboxes.class)
                        || f.isAnnotationPresent(UseChips.class))
                .filter(f -> slotFields.contains(f))
                .collect(Collectors.toList());
        for (FieldInterfaced fieldInterfaced : allEditableFields) {
            if (fieldGroup == null || fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.FieldGroup.class)) {
                String caption = "";
                if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.FieldGroup.class)) {
                    caption = fieldInterfaced.getAnnotation(io.mateu.mdd.shared.annotations.FieldGroup.class).value();
                }
                fieldGroup = FieldGroup.builder().caption(caption).lines(new ArrayList<>()).build();
                fieldGroups.add(fieldGroup);
            }
            if (fieldGroupLine == null || !fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.SameLine.class)) {
                fieldGroupLine = FieldGroupLine.builder().fields(new ArrayList<>()).build();
                fieldGroup.getLines().add(fieldGroupLine);
            }
            fieldGroupLine.getFields().add(fieldMetadataBuilder.getField(fieldInterfaced));
        }

        fillGroupIds(fieldGroups);

        return fieldGroups;
    }

    private void fillGroupIds(List<FieldGroup> fieldGroups) {
        int j = 0;
        for (FieldGroup g : fieldGroups) {
            g.setId("fieldgroup_" + j++);
        }
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