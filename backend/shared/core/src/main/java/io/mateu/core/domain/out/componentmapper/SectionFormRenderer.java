package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.declarative.FormViewToolbarBuilder.createButtons;
import static io.mateu.core.infra.declarative.FormViewToolbarBuilder.createToolbar;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.FoldedLayout;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class SectionFormRenderer {

  static Collection<? extends Component> render(
      List<Section> sections,
      Map<Section, SectionFields> fieldsPerSection,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int level) {
    if (sections.size() > 1) {
      var instanceClass = instance instanceof Class ? (Class) instance : instance.getClass();
      if (MetaAnnotations.isPresent(instanceClass, Zones.class)) {
        return List.of(
            renderZones(
                (Zones) MetaAnnotations.find(instanceClass, Zones.class),
                sections,
                fieldsPerSection,
                prefix,
                instance,
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest,
                forCreationForm,
                readOnly,
                level));
      }
      if (MetaAnnotations.isPresent(instanceClass, FoldedLayout.class)) {
        return List.of(
            HorizontalLayout.builder()
                .spacing(true)
                .content(
                    renderSections(
                        sections,
                        fieldsPerSection,
                        prefix,
                        instance,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest,
                        forCreationForm,
                        readOnly,
                        level))
                .build());
      }
      return List.of(
          VerticalLayout.builder()
              .style("width: 100%;")
              .spacing(true)
              .content(
                  renderSections(
                      sections,
                      fieldsPerSection,
                      prefix,
                      instance,
                      baseUrl,
                      route,
                      consumedRoute,
                      initiatorComponentId,
                      httpRequest,
                      forCreationForm,
                      readOnly,
                      level))
              .build());
    }
    var inline = EmbeddedOrchestratorFieldBuilder.isInlineRequest(httpRequest);
    return sections.stream()
        .map(
            section -> {
              var formLayout =
                  buildFormLayout(
                      section,
                      fieldsPerSection,
                      prefix,
                      instance,
                      baseUrl,
                      route,
                      consumedRoute,
                      initiatorComponentId,
                      httpRequest,
                      forCreationForm,
                      readOnly,
                      level);
              if (inline) {
                // Inline embedded mediator: render the section content bare, without the outlined
                // Card wrapper, so it blends into the host section/tab without duplicate framing.
                return (Component)
                    Div.builder()
                        .style("flex: 1; min-width: 0; width:100%;")
                        .children(List.of(formLayout))
                        .build();
              }
              return (Component)
                  Card.builder()
                      .variants(List.of(CardVariant.outlined))
                      .content(
                          Div.builder()
                              .style("flex: 1; min-width: 0; width:100%;")
                              .children(List.of(formLayout))
                              .build())
                      .build();
            })
        .toList();
  }

  private static List<Component> renderSections(
      List<Section> sections,
      Map<Section, SectionFields> fieldsPerSection,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int level) {
    var compact =
        MetaAnnotations.isPresent(
            instance instanceof Class ? (Class) instance : instance.getClass(),
            io.mateu.uidl.annotations.Compact.class);
    var titleStyle =
        compact
            ? "margin: 0 0 0.25rem 0; font-size: var(--lumo-font-size-l); line-height: 1.15;"
            : "";
    return sections.stream()
        .map(
            section -> {
              var toolbarTriggers =
                  collectInlineTriggers(
                      section, fieldsPerSection, instance, prefix, httpRequest, true);
              var buttonTriggers =
                  collectInlineTriggers(
                      section, fieldsPerSection, instance, prefix, httpRequest, false);
              // When the section's only field is an @Inline embedded MultiView, the embedded view
              // brings its own (demoted) title + toolbar; suppress the parent section title so the
              // two don't visually compete.
              var hideTitle = hostsInlineEmbeddedMediator(section, fieldsPerSection);

              var titleComponent =
                  hideTitle
                      ? null
                      : buildTitleRow(section.value(), toolbarTriggers, level, titleStyle);
              var formLayout =
                  buildFormLayout(
                      section,
                      fieldsPerSection,
                      prefix,
                      instance,
                      baseUrl,
                      route,
                      consumedRoute,
                      initiatorComponentId,
                      httpRequest,
                      forCreationForm,
                      readOnly,
                      level);

              var contentItems = new ArrayList<Component>();
              if (titleComponent != null) contentItems.add(titleComponent);
              contentItems.add(formLayout);
              if (!buttonTriggers.isEmpty()) {
                contentItems.add(
                    HorizontalLayout.builder()
                        .style("justify-content: flex-end; width: 100%;")
                        .content(buttonTriggers.stream().map(t -> (Component) t).toList())
                        .build());
              }

              return (Component)
                  Card.builder()
                      .style("flex: 1; min-width: 0; width:100%;")
                      .variants(List.of(CardVariant.outlined))
                      .content(
                          VerticalLayout.builder()
                              .style(section.style())
                              .content(contentItems)
                              .build())
                      .build();
            })
        .toList();
  }

  private static boolean hostsInlineEmbeddedMediator(
      Section section, Map<Section, SectionFields> fieldsPerSection) {
    var sectionFields = fieldsPerSection.get(section);
    if (sectionFields == null || sectionFields.fields().isEmpty()) return false;
    return sectionFields.fields().stream()
        .anyMatch(
            f ->
                MetaAnnotations.isPresent(f, Inline.class)
                    && io.mateu.core.infra.declarative.orchestrators.MultiView.class
                        .isAssignableFrom(f.getType()));
  }

  private static TextContainer getSectionHeaderContainer(int level) {
    if (level == 0) return TextContainer.h3;
    if (level == 1) return TextContainer.h4;
    if (level == 2) return TextContainer.h5;
    return TextContainer.h6;
  }

  private static Component buildFormLayout(
      Section section,
      Map<Section, SectionFields> fieldsPerSection,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int level) {
    var instanceType = instance instanceof Class ? (Class) instance : instance.getClass();
    // @Section(columns=N) drives the column count when set above the default (1); otherwise fall
    // back to the form-level column count so forms that don't set it keep their previous behaviour.
    int columns =
        section.columns() > 1 ? section.columns() : PageFormBuilder.getFormColumns(instanceType);
    return FormLayoutBuilder.toFormLayout(
        fieldsPerSection.get(section),
        prefix,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        columns,
        level);
  }

  /**
   * Distributes sections into the zones declared by {@link Zones} and lays the zones out side by
   * side. Each zone is a vertical column (a {@link VerticalLayout}) stacking its sections; the
   * column width comes from {@link Zone#width()}. Sections whose zone is not declared fall back
   * into a trailing flexible column so nothing is ever dropped.
   */
  private static Component renderZones(
      Zones zones,
      List<Section> sections,
      Map<Section, SectionFields> fieldsPerSection,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int level) {

    Map<String, List<Section>> sectionsByZone = new LinkedHashMap<>();
    for (Section section : sections) {
      sectionsByZone.computeIfAbsent(section.zone(), k -> new ArrayList<>()).add(section);
    }

    List<Component> columns = new ArrayList<>();
    for (Zone zone : zones.value()) {
      var zoneSections = sectionsByZone.remove(zone.name());
      if (zoneSections == null || zoneSections.isEmpty()) {
        continue;
      }
      columns.add(
          zoneColumn(
              zoneSections,
              widthStyle(zone.width()),
              fieldsPerSection,
              prefix,
              instance,
              baseUrl,
              route,
              consumedRoute,
              initiatorComponentId,
              httpRequest,
              forCreationForm,
              readOnly,
              level));
    }

    if (!sectionsByZone.isEmpty()) {
      var leftover = new ArrayList<Section>();
      sectionsByZone.values().forEach(leftover::addAll);
      columns.add(
          zoneColumn(
              leftover,
              widthStyle(""),
              fieldsPerSection,
              prefix,
              instance,
              baseUrl,
              route,
              consumedRoute,
              initiatorComponentId,
              httpRequest,
              forCreationForm,
              readOnly,
              level));
    }

    return HorizontalLayout.builder()
        .spacing(true)
        .style("width: 100%; align-items: flex-start;")
        .content(columns)
        .build();
  }

  private static Component zoneColumn(
      List<Section> zoneSections,
      String widthStyle,
      Map<Section, SectionFields> fieldsPerSection,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int level) {
    return VerticalLayout.builder()
        .spacing(true)
        .style(widthStyle)
        .content(
            renderSections(
                zoneSections,
                fieldsPerSection,
                prefix,
                instance,
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest,
                forCreationForm,
                readOnly,
                level))
        .build();
  }

  private static String widthStyle(String width) {
    return width == null || width.isBlank()
        ? "flex: 1; min-width: 0;"
        : "flex: 0 0 " + width + "; min-width: 0;";
  }

  private static Component buildTitleRow(
      String title, List<UserTrigger> toolbar, int level, String titleStyle) {
    var titleText =
        Text.builder()
            .text(title)
            .container(getSectionHeaderContainer(level))
            .style(titleStyle + " flex: 1; margin: 0;")
            .build();
    if (toolbar.isEmpty()) {
      return titleText;
    }
    var rowContent = new ArrayList<Component>();
    rowContent.add(titleText);
    toolbar.forEach(t -> rowContent.add((Component) t));
    return HorizontalLayout.builder()
        .style("align-items: center; width: 100%;")
        .content(rowContent)
        .spacing(true)
        .build();
  }

  private static List<UserTrigger> collectInlineTriggers(
      Section section,
      Map<Section, SectionFields> fieldsPerSection,
      Object instance,
      String prefix,
      HttpRequest httpRequest,
      boolean isToolbar) {
    if (instance instanceof Class<?>) return List.of();
    var sectionFields = fieldsPerSection.get(section);
    if (sectionFields == null) return List.of();
    var triggers = new ArrayList<UserTrigger>();
    for (var field : sectionFields.fields()) {
      if (!MetaAnnotations.isPresent(field, Inline.class)) continue;
      var value = getValue(field, instance);
      if (value == null) value = getValueOrNewInstance(field, instance, httpRequest);
      var fieldPrefix = ("".equals(prefix) ? "" : (prefix + "-")) + field.getName() + "-";
      var actionPrefix = "nested-form-action-" + fieldPrefix;
      if (isToolbar) {
        triggers.addAll(createToolbar(actionPrefix, value, httpRequest));
      } else {
        triggers.addAll(createButtons(actionPrefix, value, httpRequest));
      }
    }
    return triggers;
  }

  private SectionFormRenderer() {}
}
