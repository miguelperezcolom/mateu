package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.uidl.annotations.FoldoutDetail;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Function;

/**
 * {@link FoldoutDetail}: the read-only view of a record as an overview plus one foldout panel per
 * remaining section. What has nothing to show is left out — empty fields, and the sections they
 * leave empty — so the overview says what matters and the panels are the ones with content.
 */
final class FoldoutDetailRenderer {

  /** A section's body as the regular form would draw it, and its inline actions. */
  record Body(Component content, List<UserTrigger> toolbar, List<UserTrigger> buttons) {}

  private FoldoutDetailRenderer() {}

  /**
   * The foldout, or {@code null} when there is nothing to lay out that way (no section with
   * content) — the caller then draws the regular form.
   *
   * @param body how a section's body is drawn from its (non-empty) fields
   * @param overviewBody how the overview's fields are drawn — a property list
   */
  static Component render(
      FoldoutDetail foldout,
      List<Section> sections,
      Map<Section, SectionFields> fieldsPerSection,
      Object instance,
      BiFunction<Section, Map<Section, SectionFields>, Body> body,
      Function<SectionFields, Component> overviewBody) {
    var shown = new LinkedHashMap<Section, SectionFields>();
    for (var section : sections) {
      var fields = fieldsPerSection.get(section);
      if (fields == null) {
        continue;
      }
      var kept = fields.fields().stream().filter(f -> !isEmpty(f, instance)).toList();
      if (!kept.isEmpty()) {
        shown.put(section, new SectionFields(fields.label(), kept, fields.columns()));
      }
    }
    if (shown.isEmpty()) {
      return null;
    }
    var overviewTitles = Arrays.asList(foldout.overview());
    var overviewSections =
        overviewTitles.isEmpty()
            ? List.of(shown.keySet().iterator().next())
            : overviewTitles.stream()
                .flatMap(t -> shown.keySet().stream().filter(s -> t.equals(s.value())))
                .toList();

    var overview = new ArrayList<Component>();
    for (var section : overviewSections) {
      if (overviewSections.size() > 1 && section.value() != null && !section.value().isBlank()) {
        overview.add(
            Text.builder()
                .text(section.value())
                .container(TextContainer.h5)
                .style("margin: 0.5rem 0 0 0;")
                .build());
      }
      overview.add(overviewBody.apply(shown.get(section)));
    }

    var folded = Arrays.asList(foldout.folded());
    var panels = new ArrayList<FoldoutPanel>();
    var index = 0;
    for (var section : shown.keySet()) {
      index++;
      if (overviewSections.contains(section)) {
        continue;
      }
      var drawn = body.apply(section, shown);
      var content = new ArrayList<Component>();
      if (!drawn.toolbar().isEmpty()) {
        content.add(row(drawn.toolbar()));
      }
      content.add(drawn.content());
      if (!drawn.buttons().isEmpty()) {
        content.add(row(drawn.buttons()));
      }
      panels.add(
          FoldoutPanel.builder()
              .id("section-" + index)
              .title(section.value())
              .open(!folded.contains(section.value()))
              .content(
                  content.size() == 1
                      ? content.getFirst()
                      : VerticalLayout.builder().style("width: 100%;").content(content).build())
              .build());
    }

    return FoldoutLayout.builder()
        .id("_foldout")
        .overview(
            overview.size() == 1
                ? overview.getFirst()
                : VerticalLayout.builder().style("width: 100%;").content(overview).build())
        .panels(panels)
        .orientation(foldout.orientation())
        .build();
  }

  private static Component row(List<UserTrigger> triggers) {
    return HorizontalLayout.builder()
        .style("justify-content: flex-end; width: 100%;")
        .spacing(true)
        .content(triggers.stream().map(t -> (Component) t).toList())
        .build();
  }

  /**
   * Whether a field has nothing to show: null, a blank string, an empty collection, map, array or
   * optional. A value that cannot be read counts as something to show — hiding it would hide a bug.
   */
  static boolean isEmpty(Field field, Object instance) {
    if (instance == null
        || instance instanceof Class<?>
        || Modifier.isStatic(field.getModifiers())) {
      return false;
    }
    Object value;
    try {
      field.setAccessible(true);
      value = field.get(instance);
    } catch (RuntimeException | IllegalAccessException e) {
      return false;
    }
    if (value == null) {
      return true;
    }
    if (value instanceof CharSequence text) {
      return text.toString().isBlank();
    }
    if (value instanceof Collection<?> collection) {
      return collection.isEmpty();
    }
    if (value instanceof Map<?, ?> map) {
      return map.isEmpty();
    }
    if (value instanceof Optional<?> optional) {
      return optional.isEmpty();
    }
    if (value.getClass().isArray()) {
      return java.lang.reflect.Array.getLength(value) == 0;
    }
    return false;
  }
}
