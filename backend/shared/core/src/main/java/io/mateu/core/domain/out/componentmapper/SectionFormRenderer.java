package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
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
      boolean readOnly) {
    if (sections.size() > 1) {
      return List.of(
          HorizontalLayout.builder()
              .spacing(true)
              .content(
                  sections.stream()
                      .map(
                          section ->
                                  (Component) Card.builder()
                                          .style("flex: 1; min-width: 0;")
                                          .variants(List.of(CardVariant.outlined))
                                          .content(
                                  VerticalLayout.builder()
                                      .style(section.style())
                                      .content(
                                          List.of(
                                              Text.builder()
                                                  .text(section.value())
                                                  .container(TextContainer.h4)
                                                  .build(),
                                              FormLayoutBuilder.toFormLayout(
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
                                                  section.columns())))
                                      .build()).build())
                      .toList())
              .build());
    }
    return sections.stream()
        .map(
            section -> Card.builder()
                    .variants(List.of(CardVariant.outlined))
                            .content(Div.builder()
                                    .style("flex: 1; min-width: 0;")
                                    .children(List.of(FormLayoutBuilder.toFormLayout(
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
                                            section.columns())))
                                    .build()).build())
        .toList();
  }

  private SectionFormRenderer() {}
}
