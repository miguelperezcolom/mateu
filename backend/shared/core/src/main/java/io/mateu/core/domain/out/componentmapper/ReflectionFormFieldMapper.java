package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.BasicTypeChecker.isBasicArray;
import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.*;
import static io.mateu.core.domain.out.componentmapper.GridColumnBuilder.createCrudForField;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import io.mateu.uidl.interfaces.ReadOnlySupplier;
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
      int maxColumns,
      int level) {
    return getFormField(
        field,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        isReadOnly(field, instance, httpRequest),
        forCreationForm,
        maxColumns,
        level);
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
      int maxColumns,
      int level) {
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
        maxColumns,
        level);
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
      int maxColumns,
      int level) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    var fieldType = field.getType();
    if (Callable.class.isAssignableFrom(field.getType())) {
      var value = getValue(field, instance);
      fieldType = value.getClass();
    }
    // A field whose type is a routed orchestrator (a MultiView subclass) is embedded as a mediator
    // sub-app. This must run before the generic Component branch below, since orchestrators are
    // themselves Components (via DtoSupplier) and their field value is typically null.
    if (EmbeddedOrchestratorFieldBuilder.isOrchestrator(fieldType)) {
      return EmbeddedOrchestratorFieldBuilder.build(
          prefix, field, instance, initiatorComponentId, httpRequest, maxColumns);
    }
    // A field whose type has a registered ComponentAdapter is rendered as an independent island:
    // its value is bridged into a ComponentTreeSupplier, which ComponentToFragmentDtoMapper maps to
    // its own ServerSideComponentDto (own serverSideType + state + actions). It therefore
    // round-trips through the adapter on its own actions — no parent state/deserialize involvement.
    var fieldAdapter = io.mateu.core.infra.adapters.AdapterRegistry.find(fieldType);
    if (fieldAdapter != null) {
      var value = getValue(field, instance);
      if (value != null) {
        var bridge = new io.mateu.core.infra.adapters.AdaptedComponentTree(value, fieldAdapter);
        return CustomField.builder()
            .label(getLabel(field))
            .content(bridge)
            .colspan(getColspan(field, instance, httpRequest))
            .style("width: 100%;")
            .build();
      }
    }
    if (Component.class.isAssignableFrom(fieldType)) {
      var component = (Component) getValue(field, instance);
      return CustomField.builder()
          .label(getLabel(field))
          .content(component)
          .colspan(getColspan(field, instance, httpRequest))
          .style(component.style())
          .build();
    }
    if (List.class.isAssignableFrom(fieldType)
        && MetaAnnotations.isPresent(field, Composition.class)) {
      return createCrudForCompositionField(field, httpRequest, instance);
    }
    if (MetaAnnotations.isPresent(field, Composition.class)) {
      return createEditorForCompositionField(field, httpRequest, instance);
    }
    if (List.class.isAssignableFrom(fieldType)
        && !MetaAnnotations.isPresent(field, Lookup.class)
        && !MetaAnnotations.isPresent(field, Searchable.class)
        && !MetaAnnotations.isPresent(field, Composition.class)
        && !isBasic(getGenericClass(field, List.class, "E"))) {
      return createCrudForField(
          field,
          prefix,
          readOnly || PageFormBuilder.isReadOnly(field, instance, forCreationForm, httpRequest),
          httpRequest);
    }
    if (!isBasic(fieldType)
        && !fieldType.isEnum()
        && !List.class.isAssignableFrom(fieldType)
        && !Map.class.isAssignableFrom(fieldType)
        && !Amount.class.equals(fieldType)
        && !Status.class.equals(fieldType)
        && !ColumnActionGroup.class.equals(fieldType)
        && !ColumnAction.class.equals(fieldType)
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
          maxColumns,
          level + 1);
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Notice.class)) {
      // @Notice on a String field: the field's value is the notice text (interpolated from the
      // state, like @Text) — the renderer hides the notice while the value is blank.
      var annotation = MetaAnnotations.find(field, io.mateu.uidl.annotations.Notice.class);
      return io.mateu.uidl.data.Notice.builder()
          .id(getFieldId(field, prefix, readOnly))
          .text("${state." + prefix + field.getName() + "}")
          .theme(annotation.theme())
          .icon(annotation.icon().isBlank() ? null : annotation.icon())
          .actionLabel(annotation.actionLabel().isBlank() ? null : annotation.actionLabel())
          .actionId(annotation.actionId().isBlank() ? null : annotation.actionId())
          .slim(annotation.slim())
          .fullWidth(annotation.fullWidth())
          .build();
    }
    if (MetaAnnotations.isPresent(field, Text.class)) {
      var colspan = getColspan(field, instance, httpRequest);
      var attributes = new HashMap<String, String>();
      if (colspan > 1) {
        attributes.put("data-colspan", "" + colspan);
      }
      return io.mateu.uidl.data.Text.builder()
          .id(getFieldId(field, prefix, readOnly))
          .container(MetaAnnotations.find(field, Text.class).container())
          .size(MetaAnnotations.find(field, Text.class).size())
          .noMargins(MetaAnnotations.find(field, Text.class).noMargins())
          .text("${state." + prefix + field.getName() + "}")
          .attributes(attributes)
          .build();
    }
    return StandardFormFieldBuilder.build(
        prefix, field, instance, httpRequest, readOnly, forCreationForm);
  }

  private static boolean isReadOnly(Field field, Object instance, HttpRequest httpRequest) {
    return MetaAnnotations.isPresent(instance.getClass(), ReadOnly.class)
        || MetaAnnotations.isPresent(field, ReadOnly.class)
        || MetaAnnotations.isPresent(field, GeneratedValue.class)
        || PageFormBuilder.readOnlyByPermission(field, instance, httpRequest)
        || (instance instanceof ReadOnlySupplier ros
            && ros.isReadOnly(field.getName(), httpRequest));
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
      int maxColumns,
      int level) {
    return NestedFormFieldBuilder.build(
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
        maxColumns,
        level);
  }
}
