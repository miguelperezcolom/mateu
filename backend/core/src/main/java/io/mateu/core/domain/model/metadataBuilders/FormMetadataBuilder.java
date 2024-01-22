package io.mateu.core.domain.model.metadataBuilders;

import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.annotations.UseCrud;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Section;
import io.mateu.util.Helper;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FormMetadataBuilder {

  final ActionMetadataBuilder actionMetadataBuilder;
  final FieldMetadataBuilder fieldMetadataBuilder;
  final JpaRpcCrudFactory jpaRpcCrudFactory;
  final ReflectionHelper reflectionHelper;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Form build(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    if (uiInstance instanceof DynamicForm) {
      return ((DynamicForm) uiInstance).build().toFuture().get();
    }

    Form form =
        Form.builder()
            .title(getCaption(uiInstance))
            .subtitle(getSubtitle(uiInstance))
            .status(getStatus(uiInstance))
            .readOnly(isReadOnly(stepId, uiInstance))
            .badges(getBadges(uiInstance))
            .tabs(getTabs(uiInstance))
            .sections(getSections(stepId, uiInstance, slotFields))
            .actions(actionMetadataBuilder.getActions(stepId, "", uiInstance))
            .mainActions(getMainActions(stepId, uiInstance))
            .build();
    return form;
  }

  private List<Tab> getTabs(Object uiInstance) {
    if (uiInstance == null) {
      return null;
    }
    List<Tab> tabs = new ArrayList<>();
    var editableFields = reflectionHelper.getAllEditableFields(uiInstance.getClass());
    tabs.addAll(
        editableFields.stream()
            .filter(f -> f.isAnnotationPresent(io.mateu.mdd.shared.annotations.Tab.class))
            .map(
                f ->
                    new Tab(
                        "tab_" + f.getId(),
                        false,
                        f.getAnnotation(io.mateu.mdd.shared.annotations.Tab.class).value()))
            .collect(Collectors.toList()));
    if (tabs.size() > 0) {
      tabs.get(0).setActive(true);
    }
    return tabs;
  }

  private boolean isReadOnly(String stepId, Object uiInstance) {
    return "view".equals(stepId)
        || (uiInstance instanceof ReadOnlyPojo && !(uiInstance instanceof PersistentPojo))
        || (uiInstance instanceof EntityEditor && hasCrud((EntityEditor) uiInstance)
            || (uiInstance.getClass().isAnnotationPresent(Entity.class)
                && hasCrud(uiInstance.getClass())));
  }

  private boolean hasCrud(EntityEditor entityEditor) {
    return hasCrud(entityEditor.getEntityClass());
  }

  private boolean hasCrud(Class entityClass) {
    return reflectionHelper.getAllEditableFields(entityClass).stream()
            .filter(f -> f.isAnnotationPresent(UseCrud.class))
            .count()
        > 0;
  }

  public boolean isOwner(FieldInterfaced f) {
    return (f.isAnnotationPresent(OneToMany.class)
            && Arrays.stream(f.getAnnotation(OneToMany.class).cascade())
                    .filter(c -> CascadeType.ALL.equals(c) || CascadeType.PERSIST.equals(c))
                    .count()
                > 0)
        || (f.isAnnotationPresent(ManyToMany.class)
                && Arrays.stream(f.getAnnotation(ManyToMany.class).cascade())
                        .filter(c -> CascadeType.ALL.equals(c) || CascadeType.PERSIST.equals(c))
                        .count()
                    > 0)
            && f.isAnnotationPresent(UseCrud.class);
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

  private StatusType mapStatusType(io.mateu.mdd.shared.data.StatusType type) {
    return StatusType.valueOf(type.toString());
  }

  private List<Badge> getBadges(Object uiInstance) {
    if (!(uiInstance instanceof HasBadges)) {
      return List.of();
    }
    return ((HasBadges) uiInstance)
        .getBadges().stream()
            .map(b -> new Badge(mapBadgeType(b.getType()), b.getMessage()))
            .collect(Collectors.toList());
  }

  private BadgeType mapBadgeType(io.mateu.mdd.shared.data.BadgeType type) {
    return BadgeType.valueOf(type.toString());
  }

  private List<Action> getMainActions(String stepId, Object uiInstance) {
    List<Method> allMethods = reflectionHelper.getAllMethods(uiInstance.getClass());
    List<Action> actions =
        allMethods.stream()
            .filter(m -> m.isAnnotationPresent(MainAction.class))
            .sorted(Comparator.comparingInt(m -> m.getAnnotation(MainAction.class).order()))
            .map(m -> actionMetadataBuilder.getAction(m))
            .collect(Collectors.toList());
    if (!"view".equals(stepId)
        && (uiInstance instanceof PersistentPojo
            || uiInstance.getClass().isAnnotationPresent(Entity.class))) {
      Action action =
          Action.builder()
              .id("cancel")
              .caption(getCaptionForCancel(uiInstance))
              .type(ActionType.Secondary)
              .validationRequired(false)
              .visible(true)
              .build();
      actions.add(action);
      action =
          Action.builder()
              .id("save")
              .caption(getCaptionForSave(uiInstance))
              .type(ActionType.Primary)
              .validationRequired(true)
              .visible(true)
              .build();
      actions.add(action);
    }
    return actions;
  }

  private String getCaptionForCancel(Object uiInstance) {
    if (uiInstance instanceof PersistentPojo) {
      return ((PersistentPojo) uiInstance).getCaptionForCancel();
    }
    return "Cancel";
  }

  private String getCaptionForSave(Object uiInstance) {
    if (uiInstance instanceof PersistentPojo) {
      return ((PersistentPojo) uiInstance).getCaptionForSave();
    }
    return "Save";
  }

  private List<Section> getSections(
      String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    List<Section> sections = new ArrayList<>();
    Section section = null;
    FieldGroup fieldGroup = null;
    FieldGroupLine fieldGroupLine = null;
    String tabId = "";

    List<FieldInterfaced> allEditableFields =
        reflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(f -> !isOwner(f))
            .filter(f -> slotFields.contains(f))
            .collect(Collectors.toList());
    for (FieldInterfaced fieldInterfaced : allEditableFields) {
      if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.Tab.class)) {
        tabId = "tab_" + fieldInterfaced.getId();
        section = null;
      }
      if (section == null
          || fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.Section.class)) {
        String caption = "";
        String description = "";
        String leftSideImageUrl = "";
        String topImageUrl = "";
        boolean card = true;
        if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.Section.class)) {
          io.mateu.mdd.shared.annotations.Section annotation =
              fieldInterfaced.getAnnotation(io.mateu.mdd.shared.annotations.Section.class);
          caption = annotation.value();
          card = annotation.card();
          description = annotation.description();
          leftSideImageUrl = annotation.leftSideImageUrl();
          topImageUrl = annotation.topImageUrl();
        }
        section =
            Section.builder()
                .tabId(tabId)
                .caption(caption)
                .readOnly(
                    "view".equals(stepId)
                        || (uiInstance instanceof ReadOnlyPojo
                            && !(uiInstance instanceof PersistentPojo)))
                .description(description)
                .leftSideImageUrl(leftSideImageUrl)
                .topImageUrl(topImageUrl)
                .fieldGroups(new ArrayList<>())
                .type(card ? SectionType.Card : SectionType.Transparent)
                .build();
        sections.add(section);
        fieldGroup = null;
      }
      if (fieldGroup == null
          || fieldInterfaced.isAnnotationPresent(
              io.mateu.mdd.shared.annotations.FieldGroup.class)) {
        String caption = "";
        if (fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.FieldGroup.class)) {
          caption =
              fieldInterfaced
                  .getAnnotation(io.mateu.mdd.shared.annotations.FieldGroup.class)
                  .value();
        }
        fieldGroup = FieldGroup.builder().caption(caption).lines(new ArrayList<>()).build();
        section.getFieldGroups().add(fieldGroup);
      }
      if (fieldGroupLine == null
          || !fieldInterfaced.isAnnotationPresent(io.mateu.mdd.shared.annotations.SameLine.class)) {
        fieldGroupLine = FieldGroupLine.builder().fields(new ArrayList<>()).build();
        fieldGroup.getLines().add(fieldGroupLine);
      }
      fieldGroupLine.getFields().add(fieldMetadataBuilder.getField(uiInstance, fieldInterfaced));
    }

    fillSectionIds(sections);

    return sections;
  }

  private void fillSectionIds(List<Section> sections) {
    int i = 0;
    for (Section s : sections) {
      s.setId("section_" + i++);
      int j = 0;
      for (FieldGroup g : s.getFieldGroups()) {
        g.setId("fieldgroup_" + i + "_" + j++);
      }
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
    if (uiInstance != null && uiInstance instanceof ReadOnlyPojo) {
      viewTitle = ((ReadOnlyPojo) uiInstance).retrieveEntityName();
    }
    if (uiInstance != null && uiInstance instanceof PersistentPojo) {
      viewTitle = ((PersistentPojo) uiInstance).retrieveEntityName();
      if (((PersistentPojo) uiInstance).isNewRecord()) return "New " + viewTitle;
    }
    String prefix = "";
    if (!"".equals(viewTitle)) {
      prefix = viewTitle + " ";
    }

    try {
      if (Object.class.equals(modelType.getMethod("toString").getDeclaringClass())) {
        return Helper.capitalize(modelType.getSimpleName());
      } else return Helper.capitalize(uiInstance.toString());
    } catch (NoSuchMethodException e) {
    }

    return prefix + uiInstance;
  }
}
