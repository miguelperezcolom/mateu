package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.RulesBuilder;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldFromReflectionField;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.ManagedTypeChecker;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.FakeCaptionAnnotation;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBanners;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.dtos.*;
import io.mateu.dtos.Action;
import io.mateu.dtos.FieldGroup;
import io.mateu.dtos.Section;
import io.mateu.dtos.Status;
import io.mateu.dtos.Tab;
import jakarta.persistence.CascadeType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
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
  private final BasicTypeChecker basicTypeChecker;
  private final ManagedTypeChecker managedTypeChecker;
  private Section s;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Form build(Object uiInstance, List<Field> slotFields, Map<String, Object> data) {
    if (uiInstance instanceof DynamicForm) {
      return ((DynamicForm) uiInstance).build().toFuture().get();
    }

    return new Form(
        getIcon(uiInstance),
        captionProvider.getCaption(uiInstance),
        isReadOnly(uiInstance),
        getSubtitle(uiInstance),
        getStatus(uiInstance),
        getBadges(uiInstance),
        getTabs(uiInstance, data),
        getBanners(uiInstance),
        getSections(uiInstance, slotFields),
        actionMetadataBuilder.getActions(uiInstance),
        getMainActions(uiInstance),
        List.of(),
        rulesBuilder.buildRules(uiInstance));
  }

  private int getNumberOfColumns(Object uiInstance) {
    if (uiInstance == null) {
      return 1;
    }
    if (uiInstance.getClass().isAnnotationPresent(FormColumns.class)) {
      return uiInstance.getClass().getAnnotation(FormColumns.class).value();
    }
    return 1;
  }

  private String getIcon(Object uiInstance) {
    if (uiInstance instanceof HasIcon) {
      ((HasIcon) uiInstance).getIcon();
    }
    return null;
  }

  private List<Tab> getTabs(Object uiInstance, Map<String, Object> data) {
    if (uiInstance == null) {
      return null;
    }
    String activeTabId = (String) data.get("__activeTabId");
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
                        isActive("tab_" + f.getId(), first.getAndSet(false), activeTabId),
                        f.getAnnotation(
                                io.mateu.core.domain.uidefinition.shared.annotations.Tab.class)
                            .value()))
            .collect(Collectors.toList()));
    return tabs;
  }

  private boolean isActive(String tabId, boolean isFirst, String activeTabId) {
    if (activeTabId == null || activeTabId.isEmpty()) {
      return isFirst;
    }
    return activeTabId.equals(tabId);
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

  private boolean isReadOnly(Object uiInstance) {
    return uiInstance != null
        && uiInstance
            .getClass()
            .isAnnotationPresent(
                io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly.class);
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

  private List<Action> getMainActions(Object uiInstance) {
    List<Method> allMethods = reflectionHelper.getAllMethods(uiInstance.getClass());
    List<Action> actions =
        allMethods.stream()
            .filter(m -> m.isAnnotationPresent(MainAction.class))
            .map(m -> actionMetadataBuilder.getAction("", m))
            .collect(Collectors.toList());
    actions.sort(Comparator.comparing(Action::caption));
    actions.sort(Comparator.comparing(Action::order));
    return actions;
  }

  public List<Section> getSections(Object uiInstance, List<Field> slotFields) {
    List<Field> allEditableFields = getAllEditableFields(uiInstance, slotFields);

    var sections = createSections(uiInstance, allEditableFields);

    sections = fillSectionIds(sections);

    return sections;
  }

  private List<Field> getAllEditableFields(Object uiInstance, List<Field> slotFields) {
    var allFields =
        reflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(f -> !isOwner(f))
            .filter(f -> slotFields.size() == 0 || slotFields.contains(f))
            .flatMap(f -> plain(f))
            .toList();
    return allFields;
  }

  private Stream<Field> plain(Field field) {
    if (!managedTypeChecker.isManaged(field)) {
      return reflectionHelper.getAllFields(field.getType()).stream()
          .map(f -> (Field) new FieldFromReflectionField(f, createCaptionAnnotation(field, f)))
          .peek(f -> f.setId(field.getId() + "." + f.getId()));
    }
    return Stream.of(field);
  }

  private Annotation createCaptionAnnotation(Field field, Field f) {
    String parentCaption = captionProvider.getCaption(field);
    String caption = captionProvider.getCaption(f);
    String effectiveCaption = caption;
    if (f.isAnnotationPresent(ReplaceableCaption.class)) {
      effectiveCaption = parentCaption;
    }
    if (f.isAnnotationPresent(PrefixableCaption.class)) {
      effectiveCaption = parentCaption + " " + caption;
    }
    if (f.isAnnotationPresent(SuffixableCaption.class)) {
      effectiveCaption = caption + " " + parentCaption;
    }
    return new FakeCaptionAnnotation(effectiveCaption);
  }

  public List<Section> createSections(Object uiInstance, List<Field> allEditableFields) {
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
                      addSection(
                          fields,
                          uiInstance,
                          firstField,
                          tabId,
                          sections,
                          getNumberOfColumns(uiInstance));
                    }
                  });
            });
    return sections;
  }

  private void addSection(
      List<Field> fields,
      Object uiInstance,
      Field firstField,
      String tabId,
      List<Section> sections,
      int defaultColumnsNumber) {
    String caption = "";
    String description = "";
    String leftSideImageUrl = "";
    String topImageUrl = "";
    boolean card = true;
    int numberOfColumns = defaultColumnsNumber;
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
      numberOfColumns = annotation.columns();
      if (numberOfColumns <= 0) {
        numberOfColumns = defaultColumnsNumber;
      }
    }
    var section =
        new Section(
            "" + sections.size(),
            tabId,
            caption,
            description,
            isReadOnly(uiInstance),
            card ? SectionType.Card : SectionType.Transparent,
            leftSideImageUrl,
            topImageUrl,
            createFieldGroups(uiInstance, fields, numberOfColumns),
            numberOfColumns);

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
      if (field.isAnnotationPresent(
          io.mateu.core.domain.uidefinition.shared.annotations.NoTab.class)) {
        tabId = "";
      }
      fieldsByTabId.putIfAbsent(tabId, new ArrayList<>());
      fieldsByTabId.get(tabId).add(field);
    }
    return fieldsByTabId;
  }

  private List<FieldGroup> createFieldGroups(
      Object formInstance, List<Field> allEditableFields, int numberOfColumnsInSection) {
    List<FieldGroup> groups = new ArrayList<>();
    List<FieldGroupLine> lines = new ArrayList<>();
    List<io.mateu.dtos.Field> fields = new ArrayList<>();
    String currentGroupCaption = "";
    int currentGroupColumns = 0;

    for (Field field : allEditableFields) {
      if (field.isAnnotationPresent(
          io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)) {

        if (!lines.isEmpty()) {
          addGroup(
              groups,
              lines,
              fields,
              numberOfColumnsInSection,
              currentGroupCaption,
              currentGroupColumns);
        }
        String caption =
            field
                .getAnnotation(
                    io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)
                .value();
        int columns =
            field
                .getAnnotation(
                    io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)
                .columns();
        currentGroupCaption = caption;
        currentGroupColumns = columns;
        lines.clear();
      }
      if (!field.isAnnotationPresent(SameLine.class)) {
        if (!fields.isEmpty()) {
          lines.add(new FieldGroupLine(fields));
          fields = new ArrayList<>();
        }
      }
      fields.add(fieldMetadataBuilder.getField(formInstance, field));
    }

    addGroup(
        groups, lines, fields, numberOfColumnsInSection, currentGroupCaption, currentGroupColumns);

    return groups;
  }

  private void addGroup(
      List<FieldGroup> groups,
      List<FieldGroupLine> lines,
      List<io.mateu.dtos.Field> fields,
      int numberOfColumnsInSection,
      String currentGroupCaption,
      int currentGroupColumns) {
    if (!fields.isEmpty()) {
      lines.add(new FieldGroupLine(new ArrayList<>(fields)));
      fields.clear();

      int totalCols = fields.stream().map(f -> f.colspan()).reduce(Integer::sum).orElse(0);
      int requiredCols = currentGroupColumns;
      if (requiredCols == 0) {
        requiredCols = numberOfColumnsInSection;
      }
      if (requiredCols > totalCols) {
        fields.add(
            new io.mateu.dtos.Field(
                "void",
                "string",
                "element:div",
                false,
                false,
                "",
                "",
                "",
                "",
                List.of(),
                List.of(),
                List.of(),
                requiredCols - totalCols - 1));
      }
      lines.add(new FieldGroupLine(new ArrayList<>(fields)));
    }
    if (!lines.isEmpty()) {
      groups.add(
          new FieldGroup(
              "" + groups.size(),
              currentGroupCaption,
              new ArrayList<>(lines),
              currentGroupColumns));
    }
    lines.clear();
    fields.clear();
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
                                    s.fieldGroups().get(j).lines(),
                                    s.fieldGroups().get(j).columns()))
                        .toList(),
                    s.columns()))
        .toList();
  }
}
