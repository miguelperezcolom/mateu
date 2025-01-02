package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.dynamic.DynamicForm;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.RulesBuilder;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldFromReflectionField;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.ManagedTypeChecker;
import io.mateu.dtos.*;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.FieldGroupDto;
import io.mateu.dtos.SectionDto;
import io.mateu.dtos.StatusDto;
import io.mateu.dtos.TabDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.HasBadges;
import io.mateu.uidl.interfaces.HasBanners;
import io.mateu.uidl.interfaces.HasIcon;
import io.mateu.uidl.interfaces.HasStatus;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.JpaRpcCrudFactory;
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
  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;
  final RulesBuilder rulesBuilder;
  private final BasicTypeChecker basicTypeChecker;
  private final ManagedTypeChecker managedTypeChecker;
  private SectionDto s;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public FormDto build(
      Object uiInstance,
      List<Field> slotFields,
      Map<String, Object> data,
      boolean autoFocusDisabled) {
    if (uiInstance instanceof DynamicForm) {
      return ((DynamicForm) uiInstance).build().toFuture().get();
    }

    return new FormDto(
        getIcon(uiInstance),
        captionProvider.getCaption(uiInstance),
        isReadOnly(uiInstance),
        getSubtitle(uiInstance),
        getStatus(uiInstance),
        getBadges(uiInstance),
        getTabs(uiInstance, data),
        getBanners(uiInstance),
        getSections(uiInstance, slotFields, autoFocusDisabled),
        actionMetadataBuilder.getActions(uiInstance),
        getMainActions(uiInstance),
        List.of(),
        rulesBuilder.buildRules(uiInstance),
        getAttributes(uiInstance));
  }

  private Map<String, Object> getAttributes(Object uiInstance) {
    if (uiInstance == null) {
      return Map.of();
    }
    var type = uiInstance.getClass();
    Map<String, Object> attributes = new HashMap<>();
    if (type.isAnnotationPresent(Width.class)) {
      attributes.put("width", type.getAnnotation(Width.class).value());
    }
    if (type.isAnnotationPresent(MaxWidth.class)) {
      attributes.put("max-width", type.getAnnotation(MaxWidth.class).value());
    }
    if (type.isAnnotationPresent(MinWidth.class)) {
      attributes.put("min-width", type.getAnnotation(MinWidth.class).value());
    }
    return attributes;
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

  private List<TabDto> getTabs(Object uiInstance, Map<String, Object> data) {
    if (uiInstance == null) {
      return null;
    }
    String activeTabId = (String) data.get("__activeTabId");
    List<TabDto> tabs = new ArrayList<>();
    var editableFields = reflectionService.getAllEditableFields(uiInstance.getClass());
    AtomicBoolean first = new AtomicBoolean(true);
    tabs.addAll(
        editableFields.stream()
            .filter(f -> f.isAnnotationPresent(io.mateu.uidl.annotations.Tab.class))
            .map(
                f ->
                    new TabDto(
                        "tab_" + f.getId(),
                        isActive("tab_" + f.getId(), first.getAndSet(false), activeTabId),
                        f.getAnnotation(io.mateu.uidl.annotations.Tab.class).value()))
            .collect(Collectors.toList()));
    return tabs;
  }

  private boolean isActive(String tabId, boolean isFirst, String activeTabId) {
    if (activeTabId == null || activeTabId.isEmpty()) {
      return isFirst;
    }
    return activeTabId.equals(tabId);
  }

  private List<BannerDto> getBanners(Object uiInstance) {
    if (!(uiInstance instanceof HasBanners)) {
      return List.of();
    }
    return ((HasBanners) uiInstance)
        .getBanners().stream()
            .map(
                banner ->
                    new BannerDto(
                        mapBannerTheme(banner.theme()),
                        banner.hasIcon(),
                        banner.hasCloseButton(),
                        banner.title(),
                        banner.description()))
            .collect(Collectors.toList());
  }

  private BannerThemeDto mapBannerTheme(io.mateu.uidl.data.BannerTheme theme) {
    return BannerThemeDto.valueOf(theme.toString());
  }

  private boolean isReadOnly(Object uiInstance) {
    return uiInstance != null && uiInstance.getClass().isAnnotationPresent(ReadOnly.class);
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

  private StatusDto getStatus(Object uiInstance) {
    if (!(uiInstance instanceof HasStatus)) {
      return null;
    }
    HasStatus hasStatus = (HasStatus) uiInstance;
    if (hasStatus.getStatus() == null) return null;
    return new StatusDto(
        mapStatusType(hasStatus.getStatus().type()), hasStatus.getStatus().message());
  }

  private StatusTypeDto mapStatusType(io.mateu.uidl.data.StatusType type) {
    return StatusTypeDto.valueOf(type.toString());
  }

  private List<BadgeDto> getBadges(Object uiInstance) {
    if (!(uiInstance instanceof HasBadges)) {
      return List.of();
    }
    return ((HasBadges) uiInstance)
        .getBadges().stream()
            .map(
                b -> {
                  BadgeThemeDto theme = mapBadgeTheme(b.theme());
                  String label = b.label();
                  String icon = b.icon();
                  BadgeStyleDto badgeStyle = mapBadgeStyle(b.badgeStyle());
                  BadgeIconPositionDto iconPosition = mapBadgePosition(b.iconPosition());

                  if (theme != null
                      && label != null
                      && icon != null
                      && badgeStyle != null
                      && iconPosition != null) {
                    return new BadgeDto(theme, label, icon, badgeStyle, iconPosition);
                  } else if (theme != null
                      && icon != null
                      && badgeStyle != null
                      && iconPosition != null) {
                    return new BadgeDto(theme, null, icon, badgeStyle, iconPosition);
                  } else if (theme != null
                      && label != null
                      && badgeStyle != null
                      && iconPosition != null) {
                    return new BadgeDto(theme, label, null, badgeStyle, iconPosition);
                  } else {
                    return null;
                  }
                })
            .collect(Collectors.toList());
  }

  private BadgeThemeDto mapBadgeTheme(io.mateu.uidl.data.BadgeTheme theme) {
    return BadgeThemeDto.valueOf(theme.toString());
  }

  private BadgeStyleDto mapBadgeStyle(io.mateu.uidl.data.BadgeStyle badgeStyle) {
    if (badgeStyle == null) {
      return BadgeStyleDto.ROUND;
    }
    return BadgeStyleDto.valueOf(badgeStyle.toString());
  }

  private BadgeIconPositionDto mapBadgePosition(io.mateu.uidl.data.BadgeIconPosition iconPosition) {
    if (iconPosition == null) {
      return BadgeIconPositionDto.RIGHT;
    }
    return BadgeIconPositionDto.valueOf(iconPosition.toString());
  }

  private List<ActionDto> getMainActions(Object uiInstance) {
    List<Method> allMethods = reflectionService.getAllMethods(uiInstance.getClass());
    List<ActionDto> actions =
        allMethods.stream()
            .filter(m -> m.isAnnotationPresent(MainAction.class))
            .map(m -> actionMetadataBuilder.getAction("", m))
            .collect(Collectors.toList());
    actions.sort(Comparator.comparing(ActionDto::caption));
    actions.sort(Comparator.comparing(ActionDto::order));
    return actions;
  }

  public List<SectionDto> getSections(
      Object uiInstance, List<Field> slotFields, boolean autoFocusDisabled) {
    List<Field> allEditableFields = getAllEditableFields(uiInstance, slotFields);

    var sections = createSections(uiInstance, allEditableFields, autoFocusDisabled);

    sections = fillSectionIds(sections);

    return sections;
  }

  private List<Field> getAllEditableFields(Object uiInstance, List<Field> slotFields) {
    var allFields =
        reflectionService.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(f -> !isOwner(f))
            .filter(f -> slotFields.size() == 0 || slotFields.contains(f))
            .flatMap(f -> plain(f))
            .toList();
    return allFields;
  }

  private Stream<Field> plain(Field field) {
    if (!managedTypeChecker.isManaged(field)) {
      return reflectionService.getAllFields(field.getType()).stream()
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
    return new FakeLabelAnnotation(effectiveCaption);
  }

  public List<SectionDto> createSections(
      Object uiInstance, List<Field> allEditableFields, boolean autoFocusDisabled) {
    Map<String, List<Field>> fieldsByTabId = groupFieldsByTabId(allEditableFields);

    List<SectionDto> sections = new ArrayList<>();
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
                          getNumberOfColumns(uiInstance),
                          autoFocusDisabled);
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
      List<SectionDto> sections,
      int defaultColumnsNumber,
      boolean autoFocusDisabled) {
    String caption = "";
    String description = "";
    String leftSideImageUrl = "";
    String topImageUrl = "";
    boolean card = true;
    int numberOfColumns = defaultColumnsNumber;
    boolean sidePositionedLabel = false;
    String itemLabelWidth = "120px";
    if (firstField.isAnnotationPresent(io.mateu.uidl.annotations.Section.class)) {
      io.mateu.uidl.annotations.Section annotation =
          firstField.getAnnotation(io.mateu.uidl.annotations.Section.class);
      caption = annotation.value();
      card = annotation.card();
      description = annotation.description();
      leftSideImageUrl = annotation.leftSideImageUrl();
      topImageUrl = annotation.topImageUrl();
      numberOfColumns = annotation.columns();
      if (numberOfColumns <= 0) {
        numberOfColumns = defaultColumnsNumber;
      }
      sidePositionedLabel = annotation.sidePositionedLabel();
      itemLabelWidth = annotation.itemLabelWidth();
    }
    var section =
        new SectionDto(
            "" + sections.size(),
            tabId,
            caption,
            description,
            isReadOnly(uiInstance),
            card ? SectionTypeDto.Card : SectionTypeDto.Transparent,
            leftSideImageUrl,
            topImageUrl,
            createFieldGroups(uiInstance, fields, numberOfColumns, autoFocusDisabled),
            numberOfColumns,
            sidePositionedLabel,
            itemLabelWidth);

    sections.add(section);
  }

  private List<List<Field>> groupFieldsBySection(List<Field> fieldsInTab) {
    List<List<Field>> fieldsBySection = new ArrayList<>();
    List<Field> fieldsInSection = new ArrayList<>();
    fieldsInTab.forEach(
        field -> {
          if (field.isAnnotationPresent(io.mateu.uidl.annotations.Section.class)) {
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
      if (field.isAnnotationPresent(io.mateu.uidl.annotations.Tab.class)) {
        tabId = "tab_" + field.getId();
      }
      if (field.isAnnotationPresent(NoTab.class)) {
        tabId = "";
      }
      fieldsByTabId.putIfAbsent(tabId, new ArrayList<>());
      fieldsByTabId.get(tabId).add(field);
    }
    return fieldsByTabId;
  }

  private List<FieldGroupDto> createFieldGroups(
      Object formInstance,
      List<Field> allEditableFields,
      int numberOfColumnsInSection,
      boolean autoFocusDisabled) {
    List<FieldGroupDto> groups = new ArrayList<>();
    List<FieldGroupLineDto> lines = new ArrayList<>();
    List<FieldDto> fields = new ArrayList<>();
    String currentGroupCaption = "";
    int currentGroupColumns = 0;

    for (Field field : allEditableFields) {
      if (field.isAnnotationPresent(io.mateu.uidl.annotations.FieldGroup.class)) {

        if (!lines.isEmpty()) {
          addGroup(
              groups,
              lines,
              fields,
              numberOfColumnsInSection,
              currentGroupCaption,
              currentGroupColumns);
        }
        String caption = field.getAnnotation(io.mateu.uidl.annotations.FieldGroup.class).value();
        int columns = field.getAnnotation(io.mateu.uidl.annotations.FieldGroup.class).columns();
        currentGroupCaption = caption;
        currentGroupColumns = columns;
        lines.clear();
      }
      if (!field.isAnnotationPresent(SameLine.class)) {
        if (!fields.isEmpty()) {
          lines.add(new FieldGroupLineDto(fields));
          fields = new ArrayList<>();
        }
      }
      fields.add(fieldMetadataBuilder.getField(formInstance, field, autoFocusDisabled));
    }

    addGroup(
        groups, lines, fields, numberOfColumnsInSection, currentGroupCaption, currentGroupColumns);

    return groups;
  }

  private void addGroup(
      List<FieldGroupDto> groups,
      List<FieldGroupLineDto> lines,
      List<FieldDto> fields,
      int numberOfColumnsInSection,
      String currentGroupCaption,
      int currentGroupColumns) {
    if (!fields.isEmpty()) {
      lines.add(new FieldGroupLineDto(new ArrayList<>(fields)));
      fields.clear();

      int totalCols = fields.stream().map(f -> f.colspan()).reduce(Integer::sum).orElse(0);
      int requiredCols = currentGroupColumns;
      if (requiredCols == 0) {
        requiredCols = numberOfColumnsInSection;
      }
      if (requiredCols > totalCols) {
        fields.add(
            new FieldDto(
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
                requiredCols - totalCols - 1,
                false,
                false));
      }
      lines.add(new FieldGroupLineDto(new ArrayList<>(fields)));
    }
    if (!lines.isEmpty()) {
      groups.add(
          new FieldGroupDto(
              "" + groups.size(),
              currentGroupCaption,
              new ArrayList<>(lines),
              currentGroupColumns));
    }
    lines.clear();
    fields.clear();
  }

  private List<SectionDto> fillSectionIds(List<SectionDto> sections) {
    AtomicInteger i = new AtomicInteger();
    return sections.stream()
        .map(
            s ->
                new SectionDto(
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
                                new FieldGroupDto(
                                    "fieldgroup_" + i + "_" + j,
                                    s.fieldGroups().get(j).caption(),
                                    s.fieldGroups().get(j).lines(),
                                    s.fieldGroups().get(j).columns()))
                        .toList(),
                    s.columns(),
                    s.sidePositionedLabel(),
                    s.itemLabelWidth()))
        .toList();
  }
}
