package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.*;

import io.mateu.uidl.data.FormField;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;

final class StandardFormFieldBuilder {

  static Component build(
      String prefix,
      Field field,
      Object instance,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm) {
    return FormField.builder()
        .id(getFieldId(field, prefix, readOnly))
        .label(getLabel(field))
        .dataType(getDataType(field))
        .style(getStyle(field, instance, httpRequest))
        .stereotype(getStereotype(field))
        .required(isRequired(field, instance, httpRequest))
        .sliderMin(getSliderMin(field))
        .sliderMax(getSliderMax(field))
        .remoteCoordinates(getRemoteCoordinates(prefix, field))
        .readOnly(
            readOnly || PageFormBuilder.isReadOnly(field, instance, forCreationForm, httpRequest))
        .options(getOptions(field, instance, httpRequest))
        .colspan(getColspan(field))
        .description(getDescription(field))
        .attributes(getAttributes(field))
        .optionsColumns(getOptionsColumns(field))
        .build();
  }

  private StandardFormFieldBuilder() {}
}
