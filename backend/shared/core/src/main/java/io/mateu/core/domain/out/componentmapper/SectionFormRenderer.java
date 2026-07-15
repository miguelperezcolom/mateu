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

  /**
   * Bundles the many context values threaded unchanged through every rendering step (the fields per
   * section, the routing/request context and the form flags), so the private helpers take a single
   * {@code Ctx} instead of the same dozen positional parameters over and over.
   */
  private record Ctx(
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

    Class<?> instanceClass() {
      return instance instanceof Class ? (Class<?>) instance : instance.getClass();
    }
  }

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
    var ctx =
        new Ctx(
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
    return render(sections, ctx);
  }

  private static Collection<? extends Component> render(List<Section> sections, Ctx ctx) {
    if (sections.size() > 1) {
      var instanceClass = ctx.instanceClass();
      if (MetaAnnotations.isPresent(instanceClass, Zones.class)) {
        return List.of(
            renderZones((Zones) MetaAnnotations.find(instanceClass, Zones.class), sections, ctx));
      }
      if (MetaAnnotations.isPresent(instanceClass, FoldedLayout.class)) {
        return List.of(
            HorizontalLayout.builder()
                .spacing(true)
                .content(renderSections(sections, ctx))
                .build());
      }
      if (LayoutInference.preferTabs(
          instanceClass, sections, ctx.fieldsPerSection(), ctx.readOnly())) {
        return List.of(tabsFromSections(sections, ctx));
      }
      return List.of(
          VerticalLayout.builder()
              .style("width: 100%;")
              .spacing(true)
              .content(renderSections(sections, ctx))
              .build());
    }
    var inline = EmbeddedOrchestratorFieldBuilder.isInlineRequest(ctx.httpRequest());
    return sections.stream()
        .map(
            section -> {
              var formLayout = buildSectionBody(section, ctx);
              if (inline || section.frameless()) {
                // Inline embedded mediator or @Section(frameless=true): render the section content
                // bare, without the outlined Card wrapper (nor its padding), so it blends into the
                // host page without duplicate framing.
                return (Component)
                    Div.builder()
                        .style("flex: 1; min-width: 0; width:100%;")
                        .children(List.of(formLayout))
                        .build();
              }
              return (Component)
                  Card.builder()
                      .variants(List.of(CardVariant.outlined))
                      .cssClasses(sectionCssClasses(section))
                      .style(stickyStyle(section))
                      .content(
                          Div.builder()
                              .style("flex: 1; min-width: 0; width:100%;")
                              .children(List.of(formLayout))
                              .build())
                      .build();
            })
        .toList();
  }

  /**
   * Marker class every section card carries so the frontend can enumerate sections for the index.
   */
  private static String sectionCssClasses(Section section) {
    return "mateu-section" + (section.sticky() ? " mateu-section--sticky" : "");
  }

  /** When the section is {@code sticky}, pin its card while the rest of the form scrolls. */
  private static String stickyStyle(Section section) {
    return section.sticky()
        ? "position: sticky; top: var(--mateu-sticky-top, 0.5rem); z-index: 2;"
        : "";
  }

  private static List<Component> renderSections(List<Section> sections, Ctx ctx) {
    var compact =
        MetaAnnotations.isPresent(ctx.instanceClass(), io.mateu.uidl.annotations.Compact.class);
    var titleStyle =
        compact
            ? "margin: 0 0 0.25rem 0; font-size: var(--lumo-font-size-l); line-height: 1.15;"
            : "";
    return sections.stream()
        .map(
            section -> {
              var toolbarTriggers = collectInlineTriggers(section, ctx, true);
              var buttonTriggers = collectInlineTriggers(section, ctx, false);
              // When the section's only field is an @Inline embedded MultiView, the embedded view
              // brings its own (demoted) title + toolbar; suppress the parent section title so the
              // two don't visually compete. A blank/whitespace section title emits no heading at
              // all (so an untitled zoned band or column doesn't leave an empty header line).
              var hideTitle =
                  hostsInlineEmbeddedMediator(section, ctx.fieldsPerSection())
                      || section.value() == null
                      || section.value().isBlank();

              var titleComponent =
                  hideTitle
                      ? null
                      : buildTitleRow(section.value(), toolbarTriggers, ctx.level(), titleStyle);
              var formLayout = buildFormLayout(section, ctx);

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

              if (section.frameless()) {
                // @Section(frameless=true): no outlined card, no padding — the content (which
                // usually brings its own chrome) sits bare at the section's position.
                return (Component)
                    VerticalLayout.builder()
                        .style("width: 100%;" + section.style())
                        .content(contentItems)
                        .build();
              }

              return (Component)
                  Card.builder()
                      .style("flex: 1; min-width: 0; width:100%;" + stickyStyle(section))
                      .cssClasses(sectionCssClasses(section))
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

  /**
   * The body of a single-section form: the plain form layout, unless the fold-optionals inference
   * applies — then the required fields stay visible and the optional ones collapse into a "More
   * options" accordion panel underneath.
   */
  private static Component buildSectionBody(Section section, Ctx ctx) {
    if (section.propertyList()) {
      return buildFormLayout(section, ctx);
    }
    var sectionFields = ctx.fieldsPerSection().get(section);
    var plan =
        LayoutInference.foldPlan(
            ctx.instanceClass(),
            section,
            sectionFields.fields(),
            ctx.instance(),
            ctx.httpRequest(),
            ctx.readOnly(),
            ctx.forCreationForm());
    if (plan.isEmpty()) {
      return buildFormLayout(section, ctx);
    }
    int columns = sectionColumns(section, ctx);
    var main =
        toFormLayout(
            new SectionFields(sectionFields.label(), plan.get().main(), columns), columns, ctx);
    var folded =
        toFormLayout(
            new SectionFields(LayoutInference.MORE_OPTIONS_LABEL, plan.get().folded(), columns),
            columns,
            ctx);
    return VerticalLayout.builder()
        .style("width: 100%;")
        .content(
            List.of(
                main,
                AccordionLayout.builder()
                    .panels(List.of(new AccordionPanel(LayoutInference.MORE_OPTIONS_LABEL, folded)))
                    .build()))
        .build();
  }

  /**
   * Read-only view with many substantial sections (see {@link LayoutInference#preferTabs}): each
   * section becomes a tab. The tab layout carries the group semantics and is marked adaptable so
   * renderers may degrade it to an accordion on narrow viewports.
   */
  private static Component tabsFromSections(List<Section> sections, Ctx ctx) {
    return TabLayout.builder()
        .id("_tabs")
        .style("width: 100%;")
        .groupRelationship(GroupRelationship.alternative)
        .adaptable(true)
        .tabs(
            sections.stream()
                .map(
                    section ->
                        Tab.builder()
                            .label(sectionTitle(section, ctx))
                            .content(buildFormLayout(section, ctx))
                            .build())
                .toList())
        .build();
  }

  private static String sectionTitle(Section section, Ctx ctx) {
    if (section.value() != null && !section.value().isEmpty()) {
      return section.value();
    }
    var sectionFields = ctx.fieldsPerSection().get(section);
    return sectionFields != null ? sectionFields.label() : "";
  }

  /**
   * {@code @Section(columns=N)} drives the column count when set above the default (1); otherwise
   * fall back to the form-level column count so forms that don't set it keep their behaviour.
   */
  private static int sectionColumns(Section section, Ctx ctx) {
    return section.columns() > 1
        ? section.columns()
        : PageFormBuilder.getFormColumns(ctx.instanceClass());
  }

  private static Component toFormLayout(SectionFields sectionFields, int columns, Ctx ctx) {
    return FormLayoutBuilder.toFormLayout(
        sectionFields,
        ctx.prefix(),
        ctx.instance(),
        ctx.baseUrl(),
        ctx.route(),
        ctx.consumedRoute(),
        ctx.initiatorComponentId(),
        ctx.httpRequest(),
        ctx.forCreationForm(),
        ctx.readOnly(),
        columns,
        ctx.level());
  }

  private static Component buildFormLayout(Section section, Ctx ctx) {
    if (section.propertyList()) {
      return asPropertyList(toFormLayout(ctx.fieldsPerSection().get(section), 1, ctx));
    }
    return toFormLayout(ctx.fieldsPerSection().get(section), sectionColumns(section, ctx), ctx);
  }

  /**
   * {@code @Section(propertyList=true)}: the section body is a single-column list where every data
   * field is a read-only property row (plain-text value, label left / value right, divider line
   * between rows — see {@code FormField.propertyRow}). The transform recurses through the layout
   * containers {@code FormLayoutBuilder} emits (VerticalLayout → FormLayout → FormRow) and marks
   * the FormField leaves; component-holding fields are left untouched so a property-list section
   * can still end with e.g. an action or a nested component.
   */
  private static Component asPropertyList(Component component) {
    if (component instanceof FormField field) {
      if (field.dataType() != FieldDataType.component
          && field.stereotype() != FieldStereotype.grid) {
        return field.toBuilder().propertyRow(true).readOnly(true).colspan(1).build();
      }
      return field;
    }
    if (component instanceof VerticalLayout layout && layout.content() != null) {
      return layout.toBuilder().content(asPropertyList(layout.content())).build();
    }
    if (component instanceof FormLayout layout && layout.content() != null) {
      // A property list is a plain vertical stack of full-width rows: the responsive form layout
      // would size each row to its column width, leaving the dividers short of the card edge.
      return VerticalLayout.builder()
          .style("width: 100%;" + (layout.style() != null ? layout.style() : ""))
          .horizontalAlignment(HorizontalAlignment.STRETCH)
          .content(
              asPropertyList(
                  layout.content().stream()
                      .flatMap(
                          c ->
                              c instanceof FormRow row && row.content() != null
                                  ? row.content().stream()
                                  : java.util.stream.Stream.of(c))
                      .toList()))
          .build();
    }
    return component;
  }

  private static List<Component> asPropertyList(List<Component> content) {
    return content.stream().map(SectionFormRenderer::asPropertyList).toList();
  }

  /**
   * Lays out the sections of a {@link Zones} form. A section with <b>no zone</b> (blank {@link
   * Section#zone()}) is a full-width band, stacked in declaration order; a maximal run of
   * <b>zoned</b> sections collapses into one side-by-side row of columns at its position. So a
   * declaration like {@code [header(no zone), left, right]} renders the header full-width on top
   * and the left/right zones as two columns below it. Within a zoned row each zone is a vertical
   * column (a {@link VerticalLayout}) whose width comes from {@link Zone#width()}; a section
   * pointing at a zone name that is not declared falls into a trailing flexible column so nothing
   * is ever dropped.
   */
  private static Component renderZones(Zones zones, List<Section> sections, Ctx ctx) {
    List<Component> blocks = new ArrayList<>();
    List<Section> pendingZoned = new ArrayList<>();
    for (Section section : sections) {
      if (section.zone() == null || section.zone().isBlank()) {
        flushZonedRow(pendingZoned, zones, blocks, ctx);
        blocks.addAll(renderSections(List.of(section), ctx));
      } else {
        pendingZoned.add(section);
      }
    }
    flushZonedRow(pendingZoned, zones, blocks, ctx);

    // All sections zoned (no full-width band): keep the row as the single top-level component so
    // the
    // wire shape is unchanged for existing zoned forms.
    if (blocks.size() == 1) {
      return blocks.get(0);
    }
    return VerticalLayout.builder().spacing(true).style("width: 100%;").content(blocks).build();
  }

  /** Turns a run of zoned sections into one side-by-side {@link HorizontalLayout} of columns. */
  private static void flushZonedRow(
      List<Section> pendingZoned, Zones zones, List<Component> blocks, Ctx ctx) {
    if (pendingZoned.isEmpty()) {
      return;
    }
    Map<String, List<Section>> sectionsByZone = new LinkedHashMap<>();
    for (Section section : pendingZoned) {
      sectionsByZone.computeIfAbsent(section.zone(), k -> new ArrayList<>()).add(section);
    }

    List<Component> columns = new ArrayList<>();
    for (Zone zone : zones.value()) {
      var zoneSections = sectionsByZone.remove(zone.name());
      if (zoneSections == null || zoneSections.isEmpty()) {
        continue;
      }
      columns.add(zoneColumn(zoneSections, widthStyle(zone.width()), ctx));
    }

    if (!sectionsByZone.isEmpty()) {
      var leftover = new ArrayList<Section>();
      sectionsByZone.values().forEach(leftover::addAll);
      columns.add(zoneColumn(leftover, widthStyle(""), ctx));
    }

    blocks.add(
        HorizontalLayout.builder()
            .spacing(true)
            // Responsive: when a column can't keep a usable width (see widthStyle's min-width),
            // it wraps below the previous one and, thanks to flex-grow, fills the full row.
            .wrap(true)
            .style("width: 100%; align-items: flex-start;")
            .content(columns)
            .build());
    pendingZoned.clear();
  }

  private static Component zoneColumn(List<Section> zoneSections, String widthStyle, Ctx ctx) {
    return VerticalLayout.builder()
        .spacing(true)
        .style(widthStyle)
        .content(renderSections(zoneSections, ctx))
        .build();
  }

  /**
   * Zone columns are growable AND shrinkable around a flex-basis of the declared width MINUS the
   * row's spacing gap: with {@code flex-wrap} the line breaks are computed from the hypothetical
   * (basis) sizes, so a plain {@code 62% + 38% + gap > 100%} would wrap immediately (or, without
   * wrap, overflow past the full-width bands' right edge — the old {@code flex: 0 0 62%} bug). The
   * min-width sets the responsive wrap point: a column squeezed under it drops below the previous
   * one and, thanks to flex-grow, fills the full row.
   */
  private static String widthStyle(String width) {
    return width == null || width.isBlank()
        ? "flex: 1 1 12rem; min-width: min(20rem, 100%);"
        : "flex: 1 1 calc(" + width + " - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);";
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
      Section section, Ctx ctx, boolean isToolbar) {
    if (ctx.instance() instanceof Class<?>) return List.of();
    var sectionFields = ctx.fieldsPerSection().get(section);
    if (sectionFields == null) return List.of();
    var triggers = new ArrayList<UserTrigger>();
    for (var field : sectionFields.fields()) {
      if (!MetaAnnotations.isPresent(field, Inline.class)) continue;
      var value = getValue(field, ctx.instance());
      if (value == null) value = getValueOrNewInstance(field, ctx.instance(), ctx.httpRequest());
      var fieldPrefix =
          ("".equals(ctx.prefix()) ? "" : (ctx.prefix() + "-")) + field.getName() + "-";
      var actionPrefix = "nested-form-action-" + fieldPrefix;
      if (isToolbar) {
        triggers.addAll(createToolbar(actionPrefix, value, ctx.httpRequest()));
      } else {
        triggers.addAll(createButtons(actionPrefix, value, ctx.httpRequest()));
      }
    }
    // Section buttons are secondary chrome next to the section title, so render them small by
    // default (Vaadin's `small` theme variant). An explicit @Toolbar/@Button buttonSize wins.
    return triggers.stream().map(SectionFormRenderer::shrinkToSmallByDefault).toList();
  }

  private static UserTrigger shrinkToSmallByDefault(UserTrigger trigger) {
    if (trigger instanceof Button button && button.size() == null) {
      return button.toBuilder().size(ButtonSize.small).build();
    }
    return trigger;
  }

  private SectionFormRenderer() {}
}
