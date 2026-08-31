package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.*;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;

import io.mateu.core.domain.Authorizer;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
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
    if (MetaAnnotations.isPresent(instanceType, io.mateu.uidl.annotations.FormLayout.class)) {
      return MetaAnnotations.find(instanceType, io.mateu.uidl.annotations.FormLayout.class)
          .columns();
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
    return (instance != null && MetaAnnotations.isPresent(instance.getClass(), ReadOnly.class))
        || MetaAnnotations.isPresent(field, ReadOnly.class)
        || MetaAnnotations.isPresent(field, GeneratedValue.class)
        || (!forCreationForm && MetaAnnotations.isPresent(field, EditableOnlyWhenCreating.class))
        || readOnlyByPermission(field, instance, httpRequest)
        || (instance instanceof ReadOnlySupplier ros
            && ros.isReadOnly(field.getName(), httpRequest));
  }

  /** Read-only when a {@link ReadOnlyUnless} on the field or the view is not satisfied. */
  static boolean readOnlyByPermission(Field field, Object instance, HttpRequest httpRequest) {
    if (MetaAnnotations.isPresent(field, ReadOnlyUnless.class)
        && !Authorizer.isAuthorized(
            MetaAnnotations.find(field, ReadOnlyUnless.class), httpRequest)) {
      return true;
    }
    return instance != null
        && MetaAnnotations.isPresent(instance.getClass(), ReadOnlyUnless.class)
        && !Authorizer.isAuthorized(
            MetaAnnotations.find(instance.getClass(), ReadOnlyUnless.class), httpRequest);
  }

  public static boolean isForm(Object instance) {
    return FormDetector.isForm(instance);
  }

  /**
   * Whether this field renders as an input in an editable form — the question a constraint has to
   * answer before it is sent to the client as a validation.
   *
   * <p>Deliberately the filters {@link #getForm} itself applies with {@code readOnly} false — a
   * validation is only ever enforced on a form the user can type into, so that is the only case
   * worth asking about, and asking it any other way lets the two answers drift. When they drift the
   * form stops being submittable: the client refuses to save over a field that has no input, naming
   * a field nobody can see. ({@code hiddenInView} is not among them on purpose — it hides a field
   * from the read-only view, which is exactly the case this method does not cover.)
   */
  public static boolean rendersAsInput(
      Field field, Object instance, boolean forCreationForm, HttpRequest httpRequest) {
    return FormFieldFilter.filterField(field, forCreationForm, false, instance, httpRequest)
        && !FormFieldFilter.hiddenInEditor(field, forCreationForm);
  }
}
