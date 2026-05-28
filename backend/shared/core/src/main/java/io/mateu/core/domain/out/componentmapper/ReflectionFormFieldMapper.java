package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.BasicTypeChecker.isBasicArray;
import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.*;
import static io.mateu.core.domain.out.componentmapper.GridColumnBuilder.createCrudForField;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

public class ReflectionFormFieldMapper {

  public static Component getFormField(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      int maxColumns) {
    return getFormField(
        field,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        isReadOnly(field, instance),
        forCreationForm,
        maxColumns);
  }

  public static Component getFormField(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm,
      int maxColumns) {
    return getFormField(
        "",
        field,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        readOnly,
        forCreationForm,
        maxColumns);
  }

  public static Component getFormField(
      String prefix,
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm,
      int maxColumns) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    var fieldType = field.getType();
    if (Callable.class.isAssignableFrom(field.getType())) {
      var value = getValue(field, instance);
      fieldType = value.getClass();
    }
    if (Component.class.isAssignableFrom(fieldType)) {
      var component = (Component) getValue(field, instance);
      return CustomField.builder()
          .label(getLabel(field))
          .content(component)
          .colspan(getColspan(field))
          .style(component.style())
          .build();
    }
    if (List.class.isAssignableFrom(fieldType) && field.isAnnotationPresent(Composition.class)) {
      return createCrudForCompositionField(field, httpRequest, instance);
    }
    if (field.isAnnotationPresent(Composition.class)) {
      return createEditorForCompositionField(field, httpRequest, instance);
    }
    if (List.class.isAssignableFrom(fieldType)
        && !field.isAnnotationPresent(Lookup.class)
        && !field.isAnnotationPresent(Composition.class)
        && !isBasic(getGenericClass(field, List.class, "E"))) {
      return createCrudForField(
          field,
          prefix,
          readOnly || PageFormBuilder.isReadOnly(field, instance, forCreationForm),
          httpRequest);
    }
    if (!isBasic(fieldType)
        && !fieldType.isEnum()
        && !List.class.isAssignableFrom(fieldType)
        && !Map.class.isAssignableFrom(fieldType)
        && !Amount.class.equals(fieldType)
        && !Status.class.equals(fieldType)
        && !isBasicArray(fieldType)) {
      return buildNestedFormField(
          prefix,
          field,
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
    if (field.isAnnotationPresent(Text.class)) {
      var colspan = getColspan(field);
      var attributes = new HashMap<String, String>();
      if (colspan > 1) {
        attributes.put("data-colspan", "" + colspan);
      }
      return io.mateu.uidl.data.Text.builder()
          .id(getFieldId(field, prefix, readOnly))
          .container(field.getAnnotation(Text.class).container())
          .text("${state." + prefix + field.getName() + "}")
          .attributes(attributes)
          .build();
    }
    return FormField.builder()
        .id(getFieldId(field, prefix, readOnly))
        .label(getLabel(field))
        .dataType(getDataType(field))
        .style(getStyle(field))
        .stereotype(getStereotype(field))
        .required(isRequired(field))
        .sliderMin(getSliderMin(field))
        .sliderMax(getSliderMax(field))
        .remoteCoordinates(getRemoteCoordinates(prefix, field))
        .readOnly(readOnly || PageFormBuilder.isReadOnly(field, instance, forCreationForm))
        .options(getOptions(field, instance, httpRequest))
        .colspan(getColspan(field))
        .description(getDescription(field))
        .attributes(getAttributes(field))
        .optionsColumns(getOptionsColumns(field))
        .build();
  }

  private static String getLabelForNonBasic(Field field) {
    if (Runnable.class.isAssignableFrom(field.getType())) {
      return "";
    }
    return getLabel(field);
  }

  private static boolean isReadOnly(Field field, Object instance) {
    return instance.getClass().isAnnotationPresent(ReadOnly.class)
        || field.isAnnotationPresent(ReadOnly.class)
        || field.isAnnotationPresent(GeneratedValue.class);
  }

  private static Component createEditorForCompositionField(
      Field field, HttpRequest httpRequest, Object instance) {
    return new io.mateu.uidl.data.Text(field.getName(), "Pending");
  }

  private static Component createCrudForCompositionField(
      Field field, HttpRequest httpRequest, Object instance) {
    return new io.mateu.uidl.data.Text(field.getName(), "Pending");
  }

  private static Component buildNestedFormField(
      String prefix,
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int maxColumns) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    var value = instance instanceof Class ? null : getValue(field, instance);
    return CustomField.builder()
        .label(getLabelForNonBasic(field))
        .content(
            getForm(
                    ("".equals(prefix) ? "" : (prefix + "-")) + field.getName() + "-",
                    value != null ? value : field.getType(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest,
                    forCreationForm,
                    readOnly || PageFormBuilder.isReadOnly(field, instance, forCreationForm),
                    maxColumns)
                .stream()
                .findFirst()
                .orElse(null))
        .colspan(maxColumns)
        .style("width: 100%;")
        .build();
  }
}
