package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.uidl.annotations.FoldedLayout;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collection;
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
        if (instance.getClass().isAnnotationPresent(FoldedLayout.class)) {
            return List.of(
                    HorizontalLayout.builder()
                            .spacing(true)
                            .content(
                                    renderSections(sections, fieldsPerSection, prefix, instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest, forCreationForm, readOnly, level))
                            .build());
        }
        return List.of(VerticalLayout.builder()
                        .style("width: 100%;")
                        .spacing(true)
                        .content(renderSections(sections, fieldsPerSection, prefix, instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest, forCreationForm, readOnly, level))
                .build());
    }
    return sections.stream()
        .map(
            section -> Card.builder()
                    .variants(List.of(CardVariant.outlined))
                            .content(Div.builder()
                                    .style("flex: 1; min-width: 0; width:100%;")
                                    .children(List.of(buildFormLayout(section, fieldsPerSection, prefix, instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest, forCreationForm, readOnly)))
                                    .build()).build())
        .toList();
  }

    private static List<Component> renderSections(List<Section> sections, Map<Section, SectionFields> fieldsPerSection, String prefix, Object instance, String baseUrl, String route, String consumedRoute, String initiatorComponentId, HttpRequest httpRequest, boolean forCreationForm, boolean readOnly, int level) {
        return sections.stream()
                .map(
                        section ->
                                (Component) Card.builder()
                                        .style("flex: 1; min-width: 0; width:100%;")
                                        .variants(List.of(CardVariant.outlined))
                                        .content(
                                                VerticalLayout.builder()
                                                        .style(section.style())
                                                        .content(
                                                                List.of(
                                                                        Text.builder()
                                                                                .text(section.value())
                                                                                .container(getSectionHeaderContainer(level))
                                                                                .build(),
                                                                        buildFormLayout(section, fieldsPerSection, prefix, instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest, forCreationForm, readOnly)))
                                                        .build()).build())
                .toList();
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
      boolean readOnly) {
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
        section.columns());
  }

  private SectionFormRenderer() {}
}
