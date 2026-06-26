package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.*;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewToolbarBuilder.createButtons;
import static io.mateu.core.infra.declarative.FormViewToolbarBuilder.createToolbar;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.lang.reflect.Field;
import java.util.List;

final class NestedFormFieldBuilder {

  static Component build(
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
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    var value = instance instanceof Class ? null : getValue(field, instance);
    var type = value != null ? value.getClass() : field.getType();
    if (MetaAnnotations.isPresent(field, Inline.class)) {
      final var inlineValue =
          value != null ? value : getValueOrNewInstance(field, instance, httpRequest);
      var sectionReadOnly = readOnly || isReadOnly(field, instance, forCreationForm, httpRequest);
      var newPrefix = ("".equals(prefix) ? "" : (prefix + "-")) + field.getName() + "-";
      var sectionFields =
          getAllEditableFields(inlineValue.getClass()).stream()
              .filter(
                  f ->
                      FormFieldFilter.filterField(
                          f, forCreationForm, sectionReadOnly, inlineValue, httpRequest))
              .filter(f -> sectionReadOnly || !FormFieldFilter.hiddenInEditor(f, forCreationForm))
              .filter(f -> !sectionReadOnly || !FormFieldFilter.hiddenInView(f))
              .toList();
      var sf = new SectionFields("", sectionFields, maxColumns);
      return CustomField.builder()
          .label("")
          .content(
              FormLayoutBuilder.toFormLayout(
                  sf,
                  newPrefix,
                  inlineValue,
                  baseUrl,
                  route,
                  consumedRoute,
                  initiatorComponentId,
                  httpRequest,
                  forCreationForm,
                  sectionReadOnly,
                  maxColumns,
                  "",
                  level))
          .colspan(maxColumns)
          .style("width: 100%;")
          .build();
    }
    if (FormDetector.isForm(type)) {
      if (value == null) {
        value = getValueOrNewInstance(field, instance, httpRequest);
      }
      var newPrefix = ("".equals(prefix) ? "" : (prefix + "-")) + field.getName() + "-";
      return Card.builder()
          .variants(List.of(CardVariant.outlined))
          .style("width: 100%;")
          .content(
              PageView.builder()
                  .title(labelForNonBasic(field))
                  .level(level)
                  // .style(orchestrator.getStyleForView())
                  .badges(createBadges(value))
                  .content(
                      getView(
                              newPrefix,
                              value,
                              "base_url",
                              httpRequest.runActionRq().route(),
                              httpRequest.runActionRq().consumedRoute(),
                              httpRequest.runActionRq().initiatorComponentId(),
                              httpRequest,
                              false,
                              false)
                          .stream()
                          .toList())
                  .toolbar(createToolbar("nested-form-action-" + newPrefix, value, httpRequest))
                  .buttons(createButtons("nested-form-action-" + newPrefix, value, httpRequest))
                  .build())
          .build();
    }
    return CustomField.builder()
        .label(labelForNonBasic(field))
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
                    readOnly || isReadOnly(field, instance, forCreationForm, httpRequest),
                    maxColumns,
                    level + 1)
                .stream()
                .findFirst()
                .orElse(null))
        .colspan(maxColumns)
        .style("width: 100%;")
        .build();
  }

  private static String labelForNonBasic(Field field) {
    if (Runnable.class.isAssignableFrom(field.getType())) {
      return "";
    }
    return getLabel(field);
  }

  private NestedFormFieldBuilder() {}
}
