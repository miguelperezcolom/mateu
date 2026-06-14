package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.*;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.util.*;

public class PageFormBuilder {

  public static Collection<? extends Component> getView(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm) {
    return getView(
        "",
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        readOnly,
        forCreationForm);
  }

  public static Collection<? extends Component> getView(
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm) {
    if (instance instanceof AutoNamedView<?> autoNamedView) {
      instance = autoNamedView.entity();
    }
    var instanceType = instance instanceof Class ? (Class) instance : instance.getClass();
    int maxColumns = getFormColumns(instanceType);
    return getForm(
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
        0);
  }

  public static int getFormColumns(Class<?> instanceType) {
    if (instanceType.isAnnotationPresent(io.mateu.uidl.annotations.FormLayout.class)) {
      return instanceType.getAnnotation(io.mateu.uidl.annotations.FormLayout.class).columns();
    }
    return 2;
  }

  public static Collection<? extends Component> getForm(
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
    return getForm(
        "",
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        maxColumns,
        level);
  }

  public record SectionFields(String label, List<Field> fields, int columns) {}

  public record TabFields(String label, List<Field> fields, int columns) {}

  public static Collection<? extends Component> getForm(
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
    var filteredFields =
        getFormFields(instance).stream()
            .filter(
                field ->
                    FormFieldFilter.filterField(
                        field, forCreationForm, readOnly, instance, httpRequest))
            .filter(field -> readOnly || !FormFieldFilter.hiddenInEditor(field, forCreationForm))
            .filter(field -> !readOnly || !FormFieldFilter.hiddenInView(field))
            .toList();
    var grouping = FormSectionGrouper.group(filteredFields, maxColumns);
    return SectionFormRenderer.render(
        grouping.sections(),
        grouping.fieldsPerSection(),
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
  }

  private static Collection<Field> getFormFields(Object instance) {
    if (instance instanceof EditableFieldsProvider editableFieldsProvider) {
      return editableFieldsProvider.allEditableFields();
    }
    if (instance instanceof Class<?> type) {
      return getAllEditableFields(type);
    }
    return getAllEditableFields(getClass(instance));
  }

  static Object getInstance(Object instance) {
    if (Class.class.equals(instance.getClass())) {
      return null;
    }
    return instance;
  }

  private static Class getClass(Object instance) {
    if (Class.class.equals(instance.getClass())) {
      return (Class) instance;
    }
    return instance.getClass();
  }

  public static boolean isReadOnly(
      Field field, Object instance, boolean forCreationForm, HttpRequest httpRequest) {
    return (instance != null && instance.getClass().isAnnotationPresent(ReadOnly.class))
        || field.isAnnotationPresent(ReadOnly.class)
        || field.isAnnotationPresent(GeneratedValue.class)
        || (!forCreationForm && field.isAnnotationPresent(EditableOnlyWhenCreating.class))
        || (instance instanceof ReadOnlySupplier ros
            && ros.isReadOnly(field.getName(), httpRequest));
  }

  public static boolean isForm(Object instance) {
    return FormDetector.isForm(instance);
  }
}
