package io.mateu.core.domain.model.metadataBuilders;

import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.SameLine;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.core.domain.model.util.Helper;
import io.mateu.dtos.*;
import io.mateu.dtos.Card;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CardMetadataBuilder {

  final FieldMetadataBuilder fieldMetadataBuilder;
  final ReflectionHelper reflectionHelper;

  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Card build(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    Card card =
        Card.builder()
            .title(getCaption(uiInstance))
            .subtitle(getSubtitle(uiInstance))
            .fieldGroups(getFieldGroups(stepId, uiInstance, slotFields))
            .icon(getIcon(uiInstance))
            .info(getInfo(uiInstance))
            .total(getTotal(uiInstance))
            .build();
    return card;
  }

  private String getIcon(Object uiInstance) {
    if (uiInstance instanceof HasIcon) {
      return ((HasIcon) uiInstance).getIcon();
    }
    return null;
  }

  private String getInfo(Object uiInstance) {
    if (uiInstance instanceof HasInfo) {
      return ((HasInfo) uiInstance).getInfo();
    }
    return null;
  }

  private String getTotal(Object uiInstance) {
    if (uiInstance instanceof HasTotal) {
      return ((HasTotal) uiInstance).getTotal();
    }
    return null;
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
    return new Status(
        mapStatusType(hasStatus.getStatus().getType()), hasStatus.getStatus().getMessage());
  }

  private StatusType mapStatusType(io.mateu.core.domain.uidefinition.shared.data.StatusType type) {
    return StatusType.valueOf(type.toString());
  }

  private List<FieldGroup> getFieldGroups(
      String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    List<FieldGroup> fieldGroups = new ArrayList<>();
    FieldGroup fieldGroup = null;
    FieldGroupLine fieldGroupLine = null;

    List<FieldInterfaced> allEditableFields =
        reflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(
                f ->
                    (!f.isAnnotationPresent(OneToMany.class)
                            && !f.isAnnotationPresent(ManyToMany.class))
                        || !f.isAnnotationPresent(UseCrud.class))
            .filter(f -> slotFields.contains(f))
            .filter(f -> !(uiInstance instanceof HasTotal) || !f.getName().equals("total"))
            .collect(Collectors.toList());
    for (FieldInterfaced fieldInterfaced : allEditableFields) {
      if (fieldGroup == null
          || fieldInterfaced.isAnnotationPresent(
              io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)) {
        String caption = "";
        if (fieldInterfaced.isAnnotationPresent(
            io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)) {
          caption =
              fieldInterfaced
                  .getAnnotation(
                      io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)
                  .value();
        }
        fieldGroup = FieldGroup.builder().caption(caption).lines(new ArrayList<>()).build();
        fieldGroups.add(fieldGroup);
      }
      if (fieldGroupLine == null || !fieldInterfaced.isAnnotationPresent(SameLine.class)) {
        fieldGroupLine = FieldGroupLine.builder().fields(new ArrayList<>()).build();
        fieldGroup.getLines().add(fieldGroupLine);
      }
      fieldGroupLine.getFields().add(fieldMetadataBuilder.getField(uiInstance, fieldInterfaced));
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
    if (uiInstance != null && uiInstance instanceof ReadOnlyPojo)
      viewTitle = ((ReadOnlyPojo) uiInstance).retrieveEntityName();
    if (uiInstance != null && uiInstance instanceof PersistentPojo) {
      viewTitle = ((PersistentPojo) uiInstance).retrieveEntityName();
      if (((PersistentPojo) uiInstance).isNewRecord()) return "New " + viewTitle;
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
