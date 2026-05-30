package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.*;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewToolbarBuilder.createButtons;
import static io.mateu.core.infra.declarative.FormViewToolbarBuilder.createToolbar;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.lang.reflect.Field;

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
      int maxColumns) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    var value = instance instanceof Class ? null : getValue(field, instance);
    var type = value != null ? value.getClass() : field.getType();
    if (FormDetector.isForm(type)) {
      if (value == null) {
        value = getValueOrNewInstance(field, instance, httpRequest);
      }
      var newPrefix = ("".equals(prefix) ? "" : (prefix + "-")) + field.getName() + "-";
      return PageView.builder()
          .title(labelForNonBasic(field))
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
          .toolbar(createToolbar("nested-form-action-" + newPrefix, value))
          .buttons(createButtons("nested-form-action-" + newPrefix, value))
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
                    readOnly || isReadOnly(field, instance, forCreationForm),
                    maxColumns)
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
