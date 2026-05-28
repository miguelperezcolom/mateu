package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getFormField;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.core.domain.out.componentmapper.PageFormBuilder.TabFields;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Pair;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

class FormLayoutBuilder {

  static List<Component> buildRows(List<Component> fields, int columns) {
    var rows = new ArrayList<Component>();
    int col = 0;
    var pendingRow = new ArrayList<Component>();
    for (Component field : fields) {
      pendingRow.add(field);
      col += (field instanceof FormField formField) ? formField.colspan() : 1;
      if (col == columns) {
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

  static void arrangeInTabs(
      Class<?> type,
      List<Pair<Tab, List<Field>>> fieldsPerTab,
      List<Field> noTabFields,
      boolean readOnly,
      boolean forCreationForm) {
    var filteredFields =
        io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields(type)
            .stream()
            .filter(
                field ->
                    readOnly
                        || !field.isAnnotationPresent(io.mateu.uidl.annotations.Composition.class))
            .filter(field -> !io.mateu.uidl.data.Status.class.equals(field.getType()))
            .filter(field -> !field.isAnnotationPresent(io.mateu.uidl.annotations.KPI.class))
            .filter(
                field ->
                    !field.isAnnotationPresent(io.mateu.uidl.annotations.Hidden.class)
                        || !""
                            .equals(
                                field
                                    .getAnnotation(io.mateu.uidl.annotations.Hidden.class)
                                    .value()))
            .toList();
    arrangeInTabs(filteredFields, fieldsPerTab, noTabFields, readOnly, forCreationForm);
  }

  static void arrangeInTabs(
      List<Field> fields,
      List<Pair<Tab, List<Field>>> fieldsPerTab,
      List<Field> noTabFields,
      boolean readOnly,
      boolean forCreationForm) {
    Tab currentTab = null;
    List<Field> currentTabFields = new ArrayList<>();

    for (Field field : fields) {
      if (field.isAnnotationPresent(Tab.class)) {
        if (currentTab != null) {
          fieldsPerTab.add(new Pair<>(currentTab, currentTabFields));
        }
        currentTab = field.getAnnotation(Tab.class);
        currentTabFields = new ArrayList<>();
      }
      if (currentTab != null) {
        currentTabFields.add(field);
      } else {
        noTabFields.add(field);
      }
    }
    if (currentTab != null) {
      fieldsPerTab.add(new Pair<>(currentTab, currentTabFields));
    }
  }

  private static String getTabName(Pair<Tab, List<Field>> pair) {
    var label = pair.first().value();
    if (label == null || "".equals(label)) {
      label = toUpperCaseFirst(pair.second().get(0).getName());
    }
    return label;
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
      boolean readOnly) {
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
        PageFormBuilder.getFormColumns(instanceType));
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
      int maxColumns) {
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
        "");
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
      String style) {
    List<Pair<Tab, List<Field>>> fieldsPerTab = new ArrayList<>();
    List<Field> noTabFields = new ArrayList<>();
    arrangeInTabs(section.fields(), fieldsPerTab, noTabFields, readOnly, forCreationForm);
    var content = new ArrayList<Component>();
    if (!noTabFields.isEmpty()) {

      content.add(
          FormLayout.builder()
              .expandColumns(true)
              .maxColumns(maxColumns)
              .autoResponsive(true)
              .content(
                  buildRows(
                      noTabFields.stream()
                          .map(
                              field ->
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
                                          maxColumns))
                          .toList(),
                      maxColumns))
              .style(style)
              .build());
    }
    if (fieldsPerTab.size() > 0) {
      content.add(
          TabLayout.builder()
              .id("_tabs")
              .style("width: 100%;" + style)
              .tabs(
                  fieldsPerTab.stream()
                      .map(
                          pair ->
                              io.mateu.uidl.data.Tab.builder()
                                  .label(getTabName(pair))
                                  .content(
                                      toFormLayout(
                                          new TabFields(
                                              pair.first().value(), pair.second(), maxColumns),
                                          prefix,
                                          instance,
                                          baseUrl,
                                          route,
                                          consumedRoute,
                                          initiatorComponentId,
                                          httpRequest,
                                          forCreationForm,
                                          readOnly))
                                  .build())
                      .toList())
              .build());
    }
    return VerticalLayout.builder().content(content).style("width: 100%;").build();
  }

  private static Component toFormLayout(
      TabFields tab,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly) {
    var fields =
        tab.fields().stream()
            .map(
                field ->
                    (Component)
                        getFormField(
                            prefix,
                            field,
                            Class.class.equals(instance.getClass()) ? null : instance,
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest,
                            readOnly
                                || PageFormBuilder.isReadOnly(field, instance, forCreationForm),
                            forCreationForm,
                            tab.columns()))
            .toList();
    var rows = new ArrayList<Component>();
    int col = 0;
    var pendingRow = new ArrayList<Component>();
    for (Component field : fields) {
      pendingRow.add(field);
      col += (field instanceof FormField formField) ? formField.colspan() : 1;
      if (col == tab.columns()) {
        rows.add(FormRow.builder().content(pendingRow).build());
        pendingRow = new ArrayList<>();
        col = 0;
      }
    }
    if (!pendingRow.isEmpty()) {
      rows.add(FormRow.builder().content(pendingRow).build());
    }
    return FormLayout.builder()
        .maxColumns(tab.columns())
        .autoResponsive(true)
        .expandColumns(true)
        .content(rows)
        .build();
  }
}
