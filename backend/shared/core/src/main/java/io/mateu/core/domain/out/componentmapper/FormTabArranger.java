package io.mateu.core.domain.out.componentmapper;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.interfaces.Pair;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

final class FormTabArranger {

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
            .filter(field -> !field.isAnnotationPresent(io.mateu.uidl.annotations.Badge.class))
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

  static String getTabName(Pair<Tab, List<Field>> pair) {
    var label = pair.first().value();
    if (label == null || "".equals(label)) {
      label = toUpperCaseFirst(pair.second().get(0).getName());
    }
    return label;
  }
}
