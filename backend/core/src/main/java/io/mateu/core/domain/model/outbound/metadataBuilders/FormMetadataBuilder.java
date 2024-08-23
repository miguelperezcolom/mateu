package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.RulesBuilder;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.annotations.SameLine;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBanners;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.dtos.*;
import io.mateu.dtos.Section;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FormMetadataBuilder {

  final ActionMetadataBuilder actionMetadataBuilder;
  final FieldMetadataBuilder fieldMetadataBuilder;
  final JpaRpcCrudFactory jpaRpcCrudFactory;
  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;
  final RulesBuilder rulesBuilder;
  private Section s;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Form build(String stepId, Object uiInstance, List<Field> slotFields) {
    if (uiInstance instanceof DynamicForm) {
      return ((DynamicForm) uiInstance).build().toFuture().get();
    }

    return new Form(
        getIcon(uiInstance),
        captionProvider.getCaption(uiInstance),
        isReadOnly(stepId, uiInstance),
        getSubtitle(uiInstance),
        getStatus(uiInstance),
        getBadges(uiInstance),
        getTabs(uiInstance),
        getBanners(uiInstance),
        getSections(stepId, uiInstance, slotFields),
        actionMetadataBuilder.getActions(stepId, "", uiInstance),
        getMainActions(stepId, uiInstance),
        List.of(),
        rulesBuilder.buildRules(uiInstance));
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
    AtomicBoolean first = new AtomicBoolean(true);
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
                        first.getAndSet(false),
                        f.getAnnotation(
                                io.mateu.core.domain.uidefinition.shared.annotations.Tab.class)
                            .value()))
            .collect(Collectors.toList()));
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
                        mapBannerTheme(banner.getTheme()),
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

  public boolean isOwner(Field f) {
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
        && (stepId.contains("__editfield__")
            || uiInstance instanceof PersistentPojo
            || uiInstance.getClass().isAnnotationPresent(Entity.class))) {
      Action action =
          new Action(
              "cancel",
              null,
              getCaptionForCancel(uiInstance),
              ActionType.Secondary,
              true,
              false,
              false,
              false,
              null,
              ActionTarget.View,
              null,
              null,
              null);
      actions.add(action);
      action =
          new Action(
              "save",
              null,
              getCaptionForSave(uiInstance),
              ActionType.Primary,
              true,
              true,
              false,
              false,
              null,
              ActionTarget.View,
              null,
              null,
              null);
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

  public List<Section> getSections(String stepId, Object uiInstance, List<Field> slotFields)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    List<Field> allEditableFields =
        reflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(f -> !isOwner(f))
            .filter(f -> slotFields.contains(f))
            .toList();

    var sections = createSections(stepId, uiInstance, allEditableFields);

    sections = fillSectionIds(sections);

    return sections;
  }

  public List<Section> createSections(
      String stepId, Object uiInstance, List<Field> allEditableFields) {
    Map<String, List<Field>> fieldsByTabId = groupFieldsByTabId(allEditableFields);

    List<Section> sections = new ArrayList<>();
    fieldsByTabId
        .keySet()
        .forEach(
            tabId -> {
              var fieldsInTab = fieldsByTabId.get(tabId);
              List<List<Field>> fieldsBySection = groupFieldsBySection(fieldsInTab);
              fieldsBySection.forEach(
                  fields -> {
                    if (!fields.isEmpty()) {
                      var firstField = fields.get(0);
                      addSection(stepId, fields, uiInstance, firstField, tabId, sections);
                    }
                  });
            });
    return sections;
  }

  private void addSection(
      String stepId,
      List<Field> fields,
      Object uiInstance,
      Field firstField,
      String tabId,
      List<Section> sections) {
    String caption = "";
    String description = "";
    String leftSideImageUrl = "";
    String topImageUrl = "";
    boolean card = true;
    if (firstField.isAnnotationPresent(
        io.mateu.core.domain.uidefinition.shared.annotations.Section.class)) {
      io.mateu.core.domain.uidefinition.shared.annotations.Section annotation =
          firstField.getAnnotation(
              io.mateu.core.domain.uidefinition.shared.annotations.Section.class);
      caption = annotation.value();
      card = annotation.card();
      description = annotation.description();
      leftSideImageUrl = annotation.leftSideImageUrl();
      topImageUrl = annotation.topImageUrl();
    }
    var section =
        new Section(
            "" + sections.size(),
            tabId,
            caption,
            description,
            "view".equals(stepId)
                || (uiInstance instanceof ReadOnlyPojo && !(uiInstance instanceof PersistentPojo)),
            card ? SectionType.Card : SectionType.Transparent,
            leftSideImageUrl,
            topImageUrl,
            createFieldGroups(uiInstance, fields));
    sections.add(section);
  }

  private List<List<Field>> groupFieldsBySection(List<Field> fieldsInTab) {
    List<List<Field>> fieldsBySection = new ArrayList<>();
    List<Field> fieldsInSection = new ArrayList<>();
    fieldsInTab.forEach(
        field -> {
          if (field.isAnnotationPresent(
              io.mateu.core.domain.uidefinition.shared.annotations.Section.class)) {
            if (!fieldsInSection.isEmpty()) {
              fieldsBySection.add(new ArrayList<>(fieldsInSection));
              fieldsInSection.clear();
            }
          }
          fieldsInSection.add(field);
        });
    if (!fieldsInSection.isEmpty()) {
      fieldsBySection.add(fieldsInSection);
    }
    return fieldsBySection;
  }

  private Map<String, List<Field>> groupFieldsByTabId(List<Field> allEditableFields) {
    Map<String, List<Field>> fieldsByTabId = new HashMap<>();
    String tabId = "";

    for (Field field : allEditableFields) {
      if (field.isAnnotationPresent(
          io.mateu.core.domain.uidefinition.shared.annotations.Tab.class)) {
        tabId = "tab_" + field.getId();
      }
      fieldsByTabId.putIfAbsent(tabId, new ArrayList<>());
      fieldsByTabId.get(tabId).add(field);
    }
    return fieldsByTabId;
  }

  private List<FieldGroup> createFieldGroups(Object formInstance, List<Field> allEditableFields) {
    List<FieldGroup> groups = new ArrayList<>();
    List<FieldGroupLine> lines = new ArrayList<>();
    List<io.mateu.dtos.Field> fields = new ArrayList<>();
    String currentGroupCaption = "";

    for (Field field : allEditableFields) {
      if (!field.isAnnotationPresent(SameLine.class)) {
        if (!fields.isEmpty()) {
          lines.add(new FieldGroupLine(fields));
          fields = new ArrayList<>();
          if (field.isAnnotationPresent(
              io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)) {
            String caption =
                field
                    .getAnnotation(
                        io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)
                    .value();
            groups.add(new FieldGroup("" + groups.size(), currentGroupCaption, lines));
            currentGroupCaption = caption;
            lines = new ArrayList<>();
          }
        }
      }
      fields.add(fieldMetadataBuilder.getField(formInstance, field));
    }
    if (!fields.isEmpty()) {
      lines.add(new FieldGroupLine(fields));
    }
    if (!lines.isEmpty()) {
      groups.add(new FieldGroup("" + groups.size(), currentGroupCaption, lines));
    }
    return groups;
  }

  private List<Section> fillSectionIds(List<Section> sections) {
    AtomicInteger i = new AtomicInteger();
    return sections.stream()
        .map(
            s ->
                new Section(
                    "section_" + i.getAndIncrement(),
                    s.tabId(),
                    s.caption(),
                    s.description(),
                    s.readOnly(),
                    s.type(),
                    s.leftSideImageUrl(),
                    s.topImageUrl(),
                    IntStream.range(0, s.fieldGroups().size())
                        .mapToObj(
                            j ->
                                new FieldGroup(
                                    "fieldgroup_" + i + "_" + j,
                                    s.fieldGroups().get(j).caption(),
                                    s.fieldGroups().get(j).lines()))
                        .toList()))
        .toList();
  }
}
