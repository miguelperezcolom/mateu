package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.*;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Header;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInCreate;
import io.mateu.uidl.annotations.HiddenInEditor;
import io.mateu.uidl.annotations.HiddenInView;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.*;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.Map;

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
    if (instance instanceof AutoNamedView<?> autoNamedView) {
      instance = autoNamedView.entity();
    }
    var instanceType = instance instanceof Class ? (Class) instance : instance.getClass();
    int maxColumns = getFormColumns(instanceType);
    return getForm(
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        maxColumns);
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
      int maxColumns) {
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
        maxColumns);
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
      int maxColumns) {
    Map<Section, SectionFields> fieldsPerSection = new HashMap<>();
    List<Section> sections = new ArrayList<>();
    Section sectionAnnotation = null;
    SectionFields sectionFields = null;
    for (Field field :
        getFormFields(instance).stream()
            .filter(field -> filterField(field, forCreationForm, readOnly))
            .filter(field -> readOnly || !hiddenInEditor(field, forCreationForm))
            .filter(field -> !readOnly || !hiddenInView(field))
            .toList()) {
      if (sectionFields == null || field.isAnnotationPresent(Section.class)) {
        if (sectionFields != null) {
          fieldsPerSection.put(sectionAnnotation, sectionFields);
          sections.add(sectionAnnotation);
        }
        if (field.isAnnotationPresent(Section.class)) {
          sectionAnnotation = field.getAnnotation(Section.class);
        } else {
          sectionAnnotation =
              new Section() {
                @Override
                public Class<? extends Annotation> annotationType() {
                  return null;
                }

                @Override
                public String value() {
                  return "";
                }

                @Override
                public int columns() {
                  return maxColumns;
                }

                @Override
                public String style() {
                  return "";
                }
              };
        }
        sectionFields =
            new SectionFields(getLabel(field), new ArrayList<>(), sectionAnnotation.columns());
      }
      sectionFields.fields.add(field);
    }
    if (sectionFields != null) {
      sections.add(sectionAnnotation);
      fieldsPerSection.put(sectionAnnotation, sectionFields);
    }
    if (sections.size() > 1) {
      return List.of(
          io.mateu.uidl.data.HorizontalLayout.builder()
              .spacing(true)
              .content(
                  sections.stream()
                      .map(
                          section ->
                              (Component)
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
                                      .build())
                      .toList())
              .build());
    }
    return sections.stream()
        .map(
            section ->
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
                    section.columns()))
        .toList();
  }

  private static boolean hiddenInView(Field field) {
    return field.isAnnotationPresent(HiddenInView.class);
  }

  private static boolean hiddenInEditor(Field field, boolean forCreationForm) {
    if (forCreationForm) {
      return field.isAnnotationPresent(HiddenInCreate.class);
    }
    return field.isAnnotationPresent(HiddenInEditor.class);
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

  private static boolean filterField(Field field, boolean forCreationForm, boolean readOnly) {
    if (ComponentDto.class.isAssignableFrom(field.getType())) {
      return false;
    }
    if (Status.class.equals(field.getType())) {
      return false;
    }
    if (field.isAnnotationPresent(Hidden.class)
        && field.getAnnotation(Hidden.class).value().isEmpty()) {
      return false;
    }
    if (field.isAnnotationPresent(KPI.class)) {
      return false;
    }
    if (field.isAnnotationPresent(Menu.class)) {
      return false;
    }
    if (field.isAnnotationPresent(Lookup.class)) {
      return true;
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && field.isAnnotationPresent(Composition.class)) {
      return readOnly;
    }
    if (forCreationForm) {}
    return true;
  }

  public static boolean isReadOnly(Field field, Object instance, boolean forCreationForm) {
    return (instance != null && instance.getClass().isAnnotationPresent(ReadOnly.class))
        || field.isAnnotationPresent(ReadOnly.class)
        || field.isAnnotationPresent(GeneratedValue.class)
        || (!forCreationForm && field.isAnnotationPresent(EditableOnlyWhenCreating.class));
  }

  public static boolean isForm(Object instance) {
    if (instance instanceof Form) {
      return true;
    }
    return (getAllFields(instance.getClass()).stream()
                .anyMatch(
                    field ->
                        field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                            || field.isAnnotationPresent(Toolbar.class))
            || getAllMethods(instance.getClass()).stream()
                .anyMatch(
                    method ->
                        method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                            || method.isAnnotationPresent(Toolbar.class)))
        && getAllFields(instance.getClass()).stream()
            .anyMatch(
                field ->
                    !(field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                            || field.isAnnotationPresent(Toolbar.class))
                        && (!Modifier.isFinal(field.getModifiers())
                            && !field.isAnnotationPresent(ReadOnly.class)
                            && !Component.class.isAssignableFrom(field.getType())
                            && !ComponentTreeSupplier.class.isAssignableFrom(field.getType())
                            && !MicroFrontend.class.isAssignableFrom(field.getType())
                            && !(String.class.equals(field.getType())
                                && field.isAnnotationPresent(Stereotype.class)
                                && field
                                    .getAnnotation(Stereotype.class)
                                    .value()
                                    .equals(FieldStereotype.html))
                            && !field.isAnnotationPresent(KPI.class)
                            && !field.isAnnotationPresent(Menu.class)
                            && !field.isAnnotationPresent(Header.class)
                            && !field.isAnnotationPresent(Footer.class)
                            && !field.isAnnotationPresent(Avatar.class)
                            && !Status.class.isAssignableFrom(field.getType())));
  }
}
