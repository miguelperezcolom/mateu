package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FormTabArranger.arrangeInTabs;
import static io.mateu.core.domain.out.componentmapper.FormTabArranger.getTabName;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getFormField;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.core.domain.out.componentmapper.PageFormBuilder.TabFields;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Separator;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Pair;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

class FormLayoutBuilder {

  /**
   * Stereotypes that render an intrinsically wide component: squeezing them into one cell of a
   * multi-column section is never what the developer meant, so they default to the full row.
   */
  private static final Set<FieldStereotype> WIDE_STEREOTYPES =
      Set.of(
          FieldStereotype.grid,
          FieldStereotype.textarea,
          FieldStereotype.richText,
          FieldStereotype.html,
          FieldStereotype.markdown);

  /**
   * Intrinsically wide fields span the full row by default; an explicit {@code @Colspan} (any value
   * greater than 1) always wins, as everywhere else in layout inference.
   */
  private static Component widenIfIntrinsicallyWide(Component field, int columns) {
    if (columns > 1
        && field instanceof FormField formField
        && formField.colspan() <= 1
        && WIDE_STEREOTYPES.contains(formField.stereotype())) {
      return formField.toBuilder().colspan(columns).build();
    }
    return field;
  }

  static List<Component> buildRows(List<Component> fields, int columns) {
    var rows = new ArrayList<Component>();
    int col = 0;
    var pendingRow = new ArrayList<Component>();
    for (Component field : fields) {
      // A separator always takes a full row of its own: flush whatever is pending and emit it
      // alone (its data-colspan attribute makes the <hr> span every column).
      if (field instanceof Separator) {
        if (!pendingRow.isEmpty()) {
          rows.add(FormRow.builder().content(pendingRow).build());
          pendingRow = new ArrayList<>();
        }
        rows.add(FormRow.builder().content(List.of(field)).build());
        col = 0;
        continue;
      }
      field = widenIfIntrinsicallyWide(field, columns);
      int span = (field instanceof FormField formField) ? formField.colspan() : 1;
      // A field spanning the whole row gets a row of its own, like a separator.
      if (columns > 1 && span >= columns) {
        if (!pendingRow.isEmpty()) {
          rows.add(FormRow.builder().content(pendingRow).build());
          pendingRow = new ArrayList<>();
        }
        rows.add(FormRow.builder().content(List.of(field)).build());
        col = 0;
        continue;
      }
      pendingRow.add(field);
      col += span;
      if (col >= columns) {
        rows.add(FormRow.builder().content(pendingRow).build());
        pendingRow = new ArrayList<>();
        col = 0;
      }
    }
    if (!pendingRow.isEmpty()) {
      rows.add(FormRow.builder().content(pendingRow).build());
    }
    return rows;
  }

  /**
   * On {@code @Compact} pages, shrink the auto-responsive minimum column width so the layout can
   * actually pack the requested number of columns (Vaadin's default is ~13em). Null elsewhere so
   * non-compact forms keep the standard behaviour.
   */
  private static String compactColumnWidth(Object instance) {
    if (instance == null) {
      return null;
    }
    var type = instance instanceof Class ? (Class<?>) instance : instance.getClass();
    return MetaAnnotations.isPresent(type, io.mateu.uidl.annotations.Compact.class) ? "7em" : null;
  }

  static Component toFormLayout(
      SectionFields section,
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
    return toFormLayout(
        section,
        prefix,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        PageFormBuilder.getFormColumns(instanceType),
        level);
  }

  static Component toFormLayout(
      SectionFields section,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int maxColumns,
      int level) {
    return toFormLayout(
        section,
        prefix,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        maxColumns,
        "",
        level);
  }

  static Component toFormLayout(
      SectionFields section,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int maxColumns,
      String style,
      int level) {
    List<Pair<Tab, List<Field>>> fieldsPerTab = new ArrayList<>();
    List<Field> noTabFields = new ArrayList<>();
    arrangeInTabs(section.fields(), fieldsPerTab, noTabFields, readOnly, forCreationForm);
    // @Subresource fields go to the tab they name (stacked after its own fields, in order)
    Subresources.place(fieldsPerTab, noTabFields, httpRequest);
    // a tab whose `show` flag is off is not offered at all (its fields go with it)
    fieldsPerTab.removeIf(
        pair -> !io.mateu.core.domain.FeatureFlagGate.shows(pair.first().show(), httpRequest));
    // the tab the URL names (its @Tab(key) as the route's last segment) is the open one
    var routedKey = routedTabKey(fieldsPerTab, httpRequest);
    var content = new ArrayList<Component>();
    if (!noTabFields.isEmpty()) {

      content.add(
          FormLayout.builder()
              .expandColumns(true)
              .maxColumns(maxColumns)
              .autoResponsive(true)
              .columnWidth(compactColumnWidth(instance))
              .labelsAside(
                  LabelsAsideInference.labelsAside(noTabFields, maxColumns, instance, httpRequest))
              .content(
                  buildRows(
                      noTabFields.stream()
                          .flatMap(
                              field -> {
                                var formField =
                                    (Component)
                                        getFormField(
                                            prefix,
                                            field,
                                            instance,
                                            baseUrl,
                                            route,
                                            consumedRoute,
                                            initiatorComponentId,
                                            httpRequest,
                                            readOnly,
                                            forCreationForm,
                                            maxColumns,
                                            level);
                                // @SeparatorBefore: paint a full-width divider above the field.
                                if (MetaAnnotations.isPresent(
                                    field, io.mateu.uidl.annotations.SeparatorBefore.class)) {
                                  return java.util.stream.Stream.of(
                                      Separator.builder()
                                          .attributes(
                                              java.util.Map.of("data-colspan", "" + maxColumns))
                                          .build(),
                                      formField);
                                }
                                return java.util.stream.Stream.of(formField);
                              })
                          .toList(),
                      maxColumns))
              .style(style)
              .build());
    }
    if (fieldsPerTab.size() > 0) {
      var instanceType = instance instanceof Class ? (Class<?>) instance : instance.getClass();
      content.add(
          TabLayout.builder()
              .id("_tabs")
              .style("width: 100%;" + style)
              .groupRelationship(io.mateu.uidl.data.GroupRelationship.alternative)
              .adaptable(LayoutInference.enabled(instanceType))
              .tabs(
                  fieldsPerTab.stream()
                      .map(
                          pair ->
                              io.mateu.uidl.data.Tab.builder()
                                  .label(getTabName(pair))
                                  .shortcut(pair.first().shortcut())
                                  .routeKey(pair.first().key())
                                  .badge(
                                      Subresources.badge(
                                          pair.second(),
                                          instance instanceof Class ? null : instance,
                                          httpRequest))
                                  .active(
                                      routedKey != null
                                          ? routedKey.equals(pair.first().key())
                                          : pair.first().open())
                                  .content(
                                      tabContent(
                                          pair,
                                          httpRequest,
                                          () ->
                                              TabFormLayoutBuilder.toFormLayout(
                                                  new TabFields(
                                                      pair.first().value(),
                                                      pair.second(),
                                                      maxColumns),
                                                  prefix,
                                                  instance,
                                                  baseUrl,
                                                  route,
                                                  consumedRoute,
                                                  initiatorComponentId,
                                                  httpRequest,
                                                  forCreationForm,
                                                  readOnly,
                                                  level)))
                                  .build())
                      .toList())
              .build());
    }
    return VerticalLayout.builder().content(content).style("width: 100%;").build();
  }

  /**
   * The {@code @Tab(key)} the request route ends with, or {@code null}: {@code /vcns/7/gateways}
   * opens the Gateways tab of the page answering {@code /vcns/7}.
   */
  private static String routedTabKey(
      List<Pair<Tab, List<Field>>> fieldsPerTab, HttpRequest httpRequest) {
    if (httpRequest == null || httpRequest.runActionRq() == null) {
      return null;
    }
    var route = httpRequest.runActionRq().route();
    if (route == null || route.isBlank()) {
      return null;
    }
    var path = route.contains("?") ? route.substring(0, route.indexOf('?')) : route;
    path = path.replaceAll("/+$", "");
    var last = path.substring(path.lastIndexOf('/') + 1);
    return fieldsPerTab.stream()
        .map(pair -> pair.first().key())
        .filter(key -> key != null && !key.isBlank() && key.equals(last))
        .findFirst()
        .orElse(null);
  }

  /**
   * Builds a tab's content with the tab in hand: its sub-resources need to know the label they sit
   * under (not to repeat it as their title) and whether they are alone in it.
   */
  private static Component tabContent(
      Pair<Tab, List<Field>> pair,
      HttpRequest httpRequest,
      java.util.function.Supplier<Component> content) {
    if (httpRequest == null) {
      return content.get();
    }
    var previous = httpRequest.getAttribute(Subresources.CURRENT_TAB);
    httpRequest.setAttribute(
        Subresources.CURRENT_TAB,
        new Subresources.CurrentTab(
            getTabName(pair), Subresources.count(pair.second()), pair.second().size()));
    try {
      return content.get();
    } finally {
      httpRequest.setAttribute(Subresources.CURRENT_TAB, previous);
    }
  }
}
