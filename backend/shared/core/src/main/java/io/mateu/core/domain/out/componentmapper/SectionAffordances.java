package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * The section affordances of {@code @Section(editAction, addAction, viewMoreAction)} (the Redwood
 * {@code section} template's edit / add / view-more actions): plain buttons composed server-side —
 * "Edit" and "Add" on the section's title row, "View more" as a link under its content — each
 * dispatching the named action method of the form. Pure composition, so every renderer draws them
 * with its own buttons.
 */
final class SectionAffordances {

  static boolean any(Section section) {
    return !section.editAction().isBlank()
        || !section.addAction().isBlank()
        || !section.viewMoreAction().isBlank();
  }

  /** "Add" and "Edit" — the title-row affordances, in that order. */
  static List<UserTrigger> titleRow(Section section, HttpRequest httpRequest) {
    var triggers = new ArrayList<UserTrigger>();
    if (!section.addAction().isBlank()) {
      triggers.add(button("section-add", section.addAction(), "Add", ButtonStyle.tertiary));
    }
    if (!section.editAction().isBlank()) {
      triggers.add(button("section-edit", section.editAction(), "Edit", ButtonStyle.tertiary));
    }
    return triggers;
  }

  /** "View more" — under the section's content. */
  static List<UserTrigger> footer(Section section, HttpRequest httpRequest) {
    if (section.viewMoreAction().isBlank()) {
      return List.of();
    }
    return List.of(
        button("section-view-more", section.viewMoreAction(), "View more", ButtonStyle.tertiary));
  }

  /**
   * The single-section path draws no section card title; a section declaring affordances still gets
   * its title row (the section title, possibly blank, plus the buttons) and its footer link.
   */
  static Component wrap(Section section, Component body, HttpRequest httpRequest, int level) {
    if (!any(section)) {
      return body;
    }
    var content = new ArrayList<Component>();
    var top = titleRow(section, httpRequest);
    if (!top.isEmpty()) {
      content.add(
          SectionFormRenderer.buildTitleRow(
              section.value() != null ? section.value() : "", top, level, ""));
    }
    content.add(body);
    var bottom = footer(section, httpRequest);
    if (!bottom.isEmpty()) {
      content.add(
          HorizontalLayout.builder()
              .style("justify-content: flex-end; width: 100%;")
              .content(bottom.stream().map(t -> (Component) t).toList())
              .build());
    }
    return VerticalLayout.builder().style("width: 100%;").content(content).build();
  }

  private static Button button(String id, String actionId, String label, ButtonStyle style) {
    return Button.builder()
        .id(id + "-" + actionId)
        .actionId(actionId)
        .label(TranslatorContext.translate(label))
        .buttonStyle(style)
        .size(ButtonSize.small)
        .build();
  }

  private SectionAffordances() {}
}
