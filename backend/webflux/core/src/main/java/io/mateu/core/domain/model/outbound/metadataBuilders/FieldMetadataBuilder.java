package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldAttributeBuilder;
import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldStereotypeMapper;
import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.ExternalReference;
import io.mateu.uidl.data.VGap;
import io.mateu.uidl.interfaces.HasBadgesOnFields;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FieldMetadataBuilder {

  final FieldAttributeBuilder fieldAttributeBuilder;
  final FieldTypeMapper fieldTypeMapper;
  final FieldStereotypeMapper fieldStereotypeMapper;
  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;

  public FieldDto getField(Object view, Field fieldInterfaced, boolean autoFocusDisabled) {
    FieldDto field =
        new FieldDto(
            fieldInterfaced.getId(),
            fieldTypeMapper.mapFieldType(fieldInterfaced),
            fieldStereotypeMapper.mapStereotype(view, fieldInterfaced),
            isObserved(fieldInterfaced),
            isFocusWanted(fieldInterfaced, autoFocusDisabled),
            captionProvider.getCaption(fieldInterfaced),
            getPlaceholder(fieldInterfaced),
            getCssClassNames(fieldInterfaced),
            getDescription(fieldInterfaced),
            getBadges(view, fieldInterfaced),
            getValidations(fieldInterfaced),
            completeAttributes(
                view,
                fieldInterfaced,
                fieldAttributeBuilder.buildAttributes(view, fieldInterfaced),
                autoFocusDisabled),
            getColspan(fieldInterfaced),
            getRightAligned(fieldInterfaced),
            getBold(fieldInterfaced));
    return field;
  }

  private boolean getBold(Field field) {
    return field.isAnnotationPresent(Bold.class);
  }

  private boolean getRightAligned(Field field) {
    return field.isAnnotationPresent(RightAligned.class);
  }

  @SneakyThrows
  private List<PairDto> completeAttributes(
      Object view, Field field, List<PairDto> pairs, boolean autoFocusDisabled) {
    if (VGap.class.equals(field.getType())) {
      VGap vgap = (VGap) reflectionService.getValue(field, view);
      if (vgap != null) {
        pairs.add(new PairDto("height", vgap.height()));
      }
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && !reflectionService.isBasic(field.getType())
        && !ExternalReference.class.equals(field.getGenericClass())
        && !field.getGenericClass().isEnum()) {
      if (field.isAnnotationPresent(Table.class) && field.getAnnotation(Table.class).editable()) {
        var formClass = field.getAnnotation(Table.class).formClass();
        if (Void.class.equals(formClass)) {
          formClass = field.getGenericClass();
        }
        var form = reflectionService.newInstance(formClass);
        for (Field columnField : reflectionService.getAllEditableFields(formClass)) {
          pairs.add(new PairDto("field", getField(form, columnField, autoFocusDisabled)));
        }
      }
    }
    return pairs;
  }

  private int getColspan(Field field) {
    if (field.isAnnotationPresent(Colspan.class)) {
      return field.getAnnotation(Colspan.class).value();
    }
    return 1;
  }

  private boolean isFocusWanted(Field fieldInterfaced, boolean autoFocusDisabled) {
    if (autoFocusDisabled) {
      return false;
    }
    return fieldInterfaced.isAnnotationPresent(RequestFocus.class);
  }

  private List<BadgeDto> getBadges(Object view, Field field) {
    if (!(view instanceof HasBadgesOnFields)) {
      return List.of();
    }
    return ((HasBadgesOnFields) view)
        .getBadgesOnField(field.getId()).stream()
            .map(
                b ->
                    new BadgeDto(
                        mapBadgeTheme(b.theme()),
                        b.label(),
                        b.icon(),
                        mapBadgeStyle(b.badgeStyle()),
                        mapBadgePosition(b.iconPosition())))
            .collect(Collectors.toList());
  }

  private BadgeThemeDto mapBadgeTheme(io.mateu.uidl.data.BadgeTheme theme) {
    return BadgeThemeDto.valueOf(theme.toString());
  }

  private BadgeStyleDto mapBadgeStyle(io.mateu.uidl.data.BadgeStyle badgeStyle) {
    return BadgeStyleDto.valueOf(badgeStyle.toString());
  }

  private BadgeIconPositionDto mapBadgePosition(io.mateu.uidl.data.BadgeIconPosition iconPosition) {
    return BadgeIconPositionDto.valueOf(iconPosition.toString());
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

  private List<ValidationDto> getValidations(Field fieldInterfaced) {
    List<ValidationDto> validations = new ArrayList<>();
    // todo: añadir otros tipos de validación, y mensaje de error
    addRequiredValidation(fieldInterfaced, validations);
    addPatternValidation(fieldInterfaced, validations);
    addMinValidation(fieldInterfaced, validations);
    addMaxValidation(fieldInterfaced, validations);

    return validations;
  }

  private void addMinValidation(Field field, List<ValidationDto> validations) {
    if (field.isAnnotationPresent(Min.class)) {
      validations.add(
          new ValidationDto(
              ValidationTypeDto.Min,
              field.getAnnotation(Min.class).message(),
              field.getAnnotation(Min.class).value()));
    }
  }

  private void addMaxValidation(Field field, List<ValidationDto> validations) {
    if (field.isAnnotationPresent(Max.class)) {
      validations.add(
          new ValidationDto(
              ValidationTypeDto.Max,
              field.getAnnotation(Max.class).message(),
              field.getAnnotation(Max.class).value()));
    }
  }

  private void addRequiredValidation(Field field, List<ValidationDto> validations) {
    if (field.isAnnotationPresent(NotEmpty.class)
        || field.isAnnotationPresent(NotNull.class)
        || field.isAnnotationPresent(NotBlank.class)) {
      validations.add(new ValidationDto(ValidationTypeDto.NotEmpty, "Required field", null));
    }
  }

  private void addPatternValidation(Field field, List<ValidationDto> validations) {
    if (field.isAnnotationPresent(Pattern.class)) {
      validations.add(
          new ValidationDto(
              ValidationTypeDto.Pattern,
              field.getAnnotation(Pattern.class).message(),
              field.getAnnotation(Pattern.class).regexp()));
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
