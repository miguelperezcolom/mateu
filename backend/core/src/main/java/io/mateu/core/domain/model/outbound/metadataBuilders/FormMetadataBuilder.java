package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.EditPartialFormActionRunner;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.annotations.SameLine;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBanners;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;
import io.mateu.dtos.Section;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import java.lang.reflect.InvocationTargetException;
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
  final CaptionProvider captionProvider;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Form build(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    if (uiInstance instanceof DynamicForm) {
      return ((DynamicForm) uiInstance).build().toFuture().get();
    }

    Form form =
        Form.builder()
            .title(captionProvider.getCaption(uiInstance))
            .subtitle(getSubtitle(uiInstance))
            .status(getStatus(uiInstance))
            .readOnly(isReadOnly(stepId, uiInstance))
            .badges(getBadges(uiInstance))
            .banners(getBanners(uiInstance))
            .tabs(getTabs(uiInstance))
            .icon(getIcon(uiInstance))
            .sections(getSections(stepId, uiInstance, slotFields))
            .actions(actionMetadataBuilder.getActions(stepId, "", uiInstance))
            .mainActions(getMainActions(stepId, uiInstance))
            .build();
    return form;
  }

  private String getIcon(Object uiInstance) {
    if (uiInstance == null) {
      return null;
    }
    if (uiInstance instanceof HasIcon) {
      ((HasIcon) uiInstance).getIcon();
    }
    return null;
  }

  private List<Tab> getTabs(Object uiInstance) {
    if (uiInstance == null) {
      return null;
    }
    List<Tab> tabs = new ArrayList<>();
    var editableFields = reflectionHelper.getAllEditableFields(uiInstance.getClass());
    tabs.addAll(
        editableFields.stream()
            .filter(
                f ->
                    f.isAnnotationPresent(
                        io.mateu.core.domain.uidefinition.shared.annotations.Tab.class))
            .map(
                f ->
                    new Tab(
                        "tab_" + f.getId(),
                        false,
                        f.getAnnotation(
                                io.mateu.core.domain.uidefinition.shared.annotations.Tab.class)
                            .value()))
            .collect(Collectors.toList()));
    if (tabs.size() > 0) {
      tabs.get(0).setActive(true);
    }
    return tabs;
  }

  private List<Banner> getBanners(Object uiInstance) {
    if (!(uiInstance instanceof HasBanners)) {
      return List.of();
    }
    return ((HasBanners) uiInstance)
        .getBanners().stream()
            .map(
                banner ->
                    new Banner(
                        mapBannerTheme(banner.getTheme()).name().toLowerCase(),
                        banner.getHasIcon(),
                        banner.getHasCloseButton(),
                        banner.getTitle(),
                        banner.getDescription()))
            .collect(Collectors.toList());
  }

  private BannerTheme mapBannerTheme(
      io.mateu.core.domain.uidefinition.shared.data.BannerTheme theme) {
    return BannerTheme.valueOf(theme.toString());
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

  private StatusType mapStatusType(io.mateu.core.domain.uidefinition.shared.data.StatusType type) {
    return StatusType.valueOf(type.toString());
  }

  private List<Badge> getBadges(Object uiInstance) {
    if (!(uiInstance instanceof HasBadges)) {
      return List.of();
    }
    return ((HasBadges) uiInstance)
        .getBadges().stream()
            .map(
                b -> {
                  BadgeTheme theme = mapBadgeTheme(b.getTheme());
                  String label = b.getLabel();
                  String icon = b.getIcon();
                  BadgeStyle badgeStyle = mapBadgeStyle(b.getBadgeStyle());
                  BadgeIconPosition iconPosition = mapBadgePosition(b.getIconPosition());

                  if (theme != null
                      && label != null
                      && icon != null
                      && badgeStyle != null
                      && iconPosition != null) {
                    return new Badge(theme, label, icon, badgeStyle, iconPosition);
                  } else if (theme != null
                      && icon != null
                      && badgeStyle != null
                      && iconPosition != null) {
                    return new Badge(theme, null, icon, badgeStyle, iconPosition);
                  } else if (theme != null
                      && label != null
                      && badgeStyle != null
                      && iconPosition != null) {
                    return new Badge(theme, label, null, badgeStyle, iconPosition);
                  } else {
                    return null;
                  }
                })
            .collect(Collectors.toList());
  }

  private BadgeTheme mapBadgeTheme(io.mateu.core.domain.uidefinition.shared.data.BadgeTheme theme) {
    return BadgeTheme.valueOf(theme.toString());
  }

  private BadgeStyle mapBadgeStyle(
      io.mateu.core.domain.uidefinition.shared.data.BadgeStyle badgeStyle) {
    if (badgeStyle == null) {
      return BadgeStyle.ROUND;
    }
    return BadgeStyle.valueOf(badgeStyle.toString());
  }

  private BadgeIconPosition mapBadgePosition(
      io.mateu.core.domain.uidefinition.shared.data.BadgeIconPosition iconPosition) {
    if (iconPosition == null) {
      return BadgeIconPosition.RIGHT;
    }
    return BadgeIconPosition.valueOf(iconPosition.toString());
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

  private String getCaptionForEdit(Object uiInstance) {
    if (uiInstance instanceof PersistentPojo) {
      return ((PersistentPojo) uiInstance).getCaptionForSave();
    }
    return "Edit";
  }

  private List<Section> getSections(
      String stepId, Object uiInstance, List<FieldInterfaced> slotFields)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    List<Section> sections = new ArrayList<>();
    Section section = null;
    FieldGroup fieldGroup = null;
    FieldGroupLine fieldGroupLine = null;
    String tabId = "";

    List<FieldInterfaced> allEditableFields =
        reflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(f -> !isOwner(f))
            .filter(f -> slotFields.contains(f))
            .toList();
    var contador = 0;
    for (FieldInterfaced fieldInterfaced : allEditableFields) {
      if (fieldInterfaced.isAnnotationPresent(
          io.mateu.core.domain.uidefinition.shared.annotations.Tab.class)) {
        tabId = "tab_" + fieldInterfaced.getId();
        section = null;
      }
      if (PartialForm.class.isAssignableFrom(fieldInterfaced.getType())) {
        var partialFormSection =
            Section.builder()
                .caption(captionProvider.getCaption(fieldInterfaced))
                .id(fieldInterfaced.getId())
                .tabId(tabId)
                .readOnly(true)
                .description("This is a section of the partial form read only yes")
                .fieldGroups(
                    createFieldGroups(fieldInterfaced.getType(), uiInstance, fieldInterfaced))
                .type(SectionType.PartialForm)
                .actions(
                    List.of(
                        Action.builder()
                            .id(
                                EditPartialFormActionRunner.EDIT_PARTIAL_FORM_IDENTIFIER
                                    + fieldInterfaced.getId())
                            .caption(getCaptionForEdit(uiInstance))
                            .type(ActionType.Secondary)
                            .validationRequired(false)
                            .visible(true)
                            .build()))
                .build();
        sections.add(partialFormSection);
      } else {

        if (section == null
            || fieldInterfaced.isAnnotationPresent(
                io.mateu.core.domain.uidefinition.shared.annotations.Section.class)) {
          String caption = "";
          String description = "";
          String leftSideImageUrl = "";
          String topImageUrl = "";
          boolean card = true;
          if (fieldInterfaced.isAnnotationPresent(
              io.mateu.core.domain.uidefinition.shared.annotations.Section.class)) {
            io.mateu.core.domain.uidefinition.shared.annotations.Section annotation =
                fieldInterfaced.getAnnotation(
                    io.mateu.core.domain.uidefinition.shared.annotations.Section.class);
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
                  .actions(List.of())
                  .build();
          sections.add(section);
          fieldGroup = null;
        }
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
          section.getFieldGroups().add(fieldGroup);
        }
        if (fieldGroupLine == null || !fieldInterfaced.isAnnotationPresent(SameLine.class)) {
          fieldGroupLine = FieldGroupLine.builder().fields(new ArrayList<>()).build();
          fieldGroup.getLines().add(fieldGroupLine);
        }
        fieldGroupLine.getFields().add(fieldMetadataBuilder.getField(uiInstance, fieldInterfaced));
      }
    }

    fillSectionIds(sections);
    fillActionIdsForPartialForm(sections);

    return sections;
  }

  private void fillActionIdsForPartialForm(List<Section> sections) {
    for (Section section : sections) {
      for (Action action : section.getActions()) {
        if (action.getId().contains(EditPartialFormActionRunner.EDIT_PARTIAL_FORM_IDENTIFIER)) {
          action.setId(EditPartialFormActionRunner.EDIT_PARTIAL_FORM_IDENTIFIER + section.getId());
        }
      }
    }
  }

  private List<FieldGroup> createFieldGroups(
      Class<?> partialFormType, Object formInstance, FieldInterfaced partialFormField)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    FieldGroup fieldGroup = null;
    FieldGroupLine fieldGroupLine = null;
    Object partialFormInstance = reflectionHelper.getValue(partialFormField, formInstance);
    if (partialFormInstance == null) {
      partialFormInstance = reflectionHelper.newInstance(partialFormType);
    }

    List<FieldGroup> fieldGroups = new ArrayList<>();

    List<FieldInterfaced> allEditableFields =
        reflectionHelper.getAllEditableFields(partialFormType).stream()
            .filter(f -> !isOwner(f))
            .toList();
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
      fieldGroupLine
          .getFields()
          .add(fieldMetadataBuilder.getField(partialFormInstance, fieldInterfaced));
    }
    for (FieldGroup group : fieldGroups) {
      for (FieldGroupLine line : group.getLines()) {
        for (Field field : line.getFields()) {
          field.setId("__nestedData__" + partialFormField.getId() + "__" + field.getId());
        }
      }
    }
    return fieldGroups;
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
}
