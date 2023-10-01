package io.mateu.core.domain.metadataBuilders;

import io.mateu.core.domain.metadataBuilders.fields.FieldAttributeBuilder;
import io.mateu.core.domain.metadataBuilders.fields.FieldStereotypeMapper;
import io.mateu.core.domain.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FieldMetadataBuilder {

  @Autowired FieldAttributeBuilder fieldAttributeBuilder;

  @Autowired FieldTypeMapper fieldTypeMapper;

  @Autowired FieldStereotypeMapper fieldStereotypeMapper;

  protected Field getField(Object view, FieldInterfaced fieldInterfaced) {
    Field field =
        Field.builder()
            .id(fieldInterfaced.getId())
            .caption(ReflectionHelper.getCaption(fieldInterfaced))
            .placeholder(getPlaceholder(fieldInterfaced))
            .description(getDescription(fieldInterfaced))
            .cssClasses(getCssClassNames(fieldInterfaced))
            .type(fieldTypeMapper.mapFieldType(fieldInterfaced))
            .stereotype(fieldStereotypeMapper.mapStereotype(view, fieldInterfaced))
            .observed(isObserved(fieldInterfaced))
            .attributes(fieldAttributeBuilder.buildAttributes(view, fieldInterfaced))
            .build();
    addValidations(field, fieldInterfaced);
    return field;
  }

  private boolean isObserved(FieldInterfaced fieldInterfaced) {
    return fieldInterfaced.isAnnotationPresent(CallActionOnChange.class);
  }

  private String getCssClassNames(FieldInterfaced fieldInterfaced) {
    if (fieldInterfaced.isAnnotationPresent(StyleClassNames.class)) {
      return String.join(" ", fieldInterfaced.getAnnotation(StyleClassNames.class).value());
    }
    return null;
  }

  private String getPlaceholder(FieldInterfaced fieldInterfaced) {
    if (fieldInterfaced.isAnnotationPresent(Placeholder.class)) {
      return fieldInterfaced.getAnnotation(Placeholder.class).value();
    }
    return null;
  }

  private void addValidations(Field field, FieldInterfaced fieldInterfaced) {
    List<Validation> validations = new ArrayList<>();
    // todo: añadir otros tipos de validación, y mensaje de error
    addRequiredValidation(fieldInterfaced, validations);
    addPatternValidation(fieldInterfaced, validations);
    addMinValidation(fieldInterfaced, validations);
    addMaxValidation(fieldInterfaced, validations);

    field.setValidations(validations);
  }

  private void addMinValidation(FieldInterfaced field, List<Validation> validations) {
    if (field.isAnnotationPresent(Min.class)) {
      validations.add(
          Validation.builder()
              .type(ValidationType.Min)
              .data(field.getAnnotation(Min.class).value())
              .message(field.getAnnotation(Min.class).message())
              .build());
    }
  }

  private void addMaxValidation(FieldInterfaced field, List<Validation> validations) {
    if (field.isAnnotationPresent(Max.class)) {
      validations.add(
          Validation.builder()
              .type(ValidationType.Max)
              .data(field.getAnnotation(Max.class).value())
              .message(field.getAnnotation(Max.class).message())
              .build());
    }
  }

  private void addRequiredValidation(FieldInterfaced field, List<Validation> validations) {
    if (field.isAnnotationPresent(NotEmpty.class)
        || field.isAnnotationPresent(NotNull.class)
        || field.isAnnotationPresent(NotBlank.class)) {
      validations.add(
          Validation.builder()
              .type(ValidationType.NotEmpty)
              .data(null)
              .message("Required field")
              .build());
    }
  }

  private void addPatternValidation(FieldInterfaced field, List<Validation> validations) {
    if (field.isAnnotationPresent(Pattern.class)) {
      validations.add(
          Validation.builder()
              .type(ValidationType.Pattern)
              .data(field.getAnnotation(Pattern.class).regexp())
              .message(field.getAnnotation(Pattern.class).message())
              .build());
    }
  }

  private String getDescription(FieldInterfaced fieldInterfaced) {
    String description = null;
    if (fieldInterfaced.isAnnotationPresent(Help.class)) {
      description = fieldInterfaced.getAnnotation(Help.class).value();
    }
    return description;
  }
}
