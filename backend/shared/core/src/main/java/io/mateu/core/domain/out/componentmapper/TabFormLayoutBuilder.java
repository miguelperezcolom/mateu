package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FormLayoutBuilder.buildRows;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isReadOnly;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getFormField;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.TabFields;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;

final class TabFormLayoutBuilder {

  static Component toFormLayout(
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
                            readOnly || isReadOnly(field, instance, forCreationForm),
                            forCreationForm,
                            tab.columns()))
            .toList();
    return FormLayout.builder()
        .maxColumns(tab.columns())
        .autoResponsive(true)
        .expandColumns(true)
        .content(buildRows(fields, tab.columns()))
        .build();
  }

  private TabFormLayoutBuilder() {}
}
