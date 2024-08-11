package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldAttributeBuilder;
import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldStereotypeMapper;
import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.CallActionOnChange;
import io.mateu.core.domain.uidefinition.shared.annotations.Help;
import io.mateu.core.domain.uidefinition.shared.annotations.Placeholder;
import io.mateu.core.domain.uidefinition.shared.annotations.StyleClassNames;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadgesOnFields;
import io.mateu.dtos.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FieldMetadataBuilder {

  final FieldAttributeBuilder fieldAttributeBuilder;
  final FieldTypeMapper fieldTypeMapper;
  final FieldStereotypeMapper fieldStereotypeMapper;
  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;

  protected io.mateu.dtos.Field getField(Object view, Field fieldInterfaced) {
    io.mateu.dtos.Field field = new io.mateu.dtos.Field(
            fieldInterfaced.getId(),
            fieldTypeMapper.mapFieldType(fieldInterfaced),
            fieldStereotypeMapper.mapStereotype(view, fieldInterfaced),
            isObserved(fieldInterfaced),
            captionProvider.getCaption(fieldInterfaced),
            getPlaceholder(fieldInterfaced),
            getCssClassNames(fieldInterfaced),
            getDescription(fieldInterfaced),
            getBadges(view, fieldInterfaced),
            getValidations(fieldInterfaced),
            fieldAttributeBuilder.buildAttributes(view, fieldInterfaced)
    );
    return field;
  }

  private List<Badge> getBadges(Object view, Field field) {
    if (!(view instanceof HasBadgesOnFields)) {
      return List.of();
    }
    return ((HasBadgesOnFields) view)
        .getBadgesOnField(field.getId()).stream()
            .map(
                b ->
                    new Badge(
                        mapBadgeTheme(b.getTheme()),
                        b.getLabel(),
                        b.getIcon(),
                        mapBadgeStyle(b.getBadgeStyle()),
                        mapBadgePosition(b.getIconPosition())))
            .collect(Collectors.toList());
  }

  private BadgeTheme mapBadgeTheme(io.mateu.core.domain.uidefinition.shared.data.BadgeTheme theme) {
    return BadgeTheme.valueOf(theme.toString());
  }

  private BadgeStyle mapBadgeStyle(
      io.mateu.core.domain.uidefinition.shared.data.BadgeStyle badgeStyle) {
    return BadgeStyle.valueOf(badgeStyle.toString());
  }

  private BadgeIconPosition mapBadgePosition(
      io.mateu.core.domain.uidefinition.shared.data.BadgeIconPosition iconPosition) {
    return BadgeIconPosition.valueOf(iconPosition.toString());
  }

  private boolean isObserved(Field field) {
    return field.isAnnotationPresent(CallActionOnChange.class);
  }

  private String getCssClassNames(Field field) {
    if (field.isAnnotationPresent(StyleClassNames.class)) {
      return String.join(" ", field.getAnnotation(StyleClassNames.class).value());
    }
    return null;
  }

  private String getPlaceholder(Field field) {
    if (field.isAnnotationPresent(Placeholder.class)) {
      return field.getAnnotation(Placeholder.class).value();
    }
    return null;
  }

  private List<Validation> getValidations(Field fieldInterfaced) {
    List<Validation> validations = new ArrayList<>();
    // todo: añadir otros tipos de validación, y mensaje de error
    addRequiredValidation(fieldInterfaced, validations);
    addPatternValidation(fieldInterfaced, validations);
    addMinValidation(fieldInterfaced, validations);
    addMaxValidation(fieldInterfaced, validations);

    return validations;
  }

  private void addMinValidation(Field field, List<Validation> validations) {
    if (field.isAnnotationPresent(Min.class)) {
      validations.add(
          Validation.builder()
              .type(ValidationType.Min)
              .data(field.getAnnotation(Min.class).value())
              .message(field.getAnnotation(Min.class).message())
              .build());
    }
  }

  private void addMaxValidation(Field field, List<Validation> validations) {
    if (field.isAnnotationPresent(Max.class)) {
      validations.add(
          Validation.builder()
              .type(ValidationType.Max)
              .data(field.getAnnotation(Max.class).value())
              .message(field.getAnnotation(Max.class).message())
              .build());
    }
  }

  private void addRequiredValidation(Field field, List<Validation> validations) {
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

  private void addPatternValidation(Field field, List<Validation> validations) {
    if (field.isAnnotationPresent(Pattern.class)) {
      validations.add(
          Validation.builder()
              .type(ValidationType.Pattern)
              .data(field.getAnnotation(Pattern.class).regexp())
              .message(field.getAnnotation(Pattern.class).message())
              .build());
    }
  }

  private String getDescription(Field field) {
    String description = null;
    if (field.isAnnotationPresent(Help.class)) {
      description = field.getAnnotation(Help.class).value();
    }
    return description;
  }
}
