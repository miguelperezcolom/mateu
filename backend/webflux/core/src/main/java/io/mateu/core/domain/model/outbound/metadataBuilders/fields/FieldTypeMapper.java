package io.mateu.core.domain.model.outbound.metadataBuilders.fields;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.StatusDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.ExternalReference;
import io.mateu.uidl.data.IconChooser;
import io.mateu.uidl.data.TelephoneNumber;
import io.mateu.uidl.data.VGap;
import io.mateu.uidl.interfaces.Icon;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import org.springframework.stereotype.Service;

@Service
public class FieldTypeMapper {

  public String mapFieldType(Field field) {
    Class<?> type = field.getType();
    if (VGap.class.equals(field.getType())) {
      return "vgap";
    }
    if (field.isAnnotationPresent(Output.class)) {
      return "output";
    }
    if (field.isAnnotationPresent(Button.class)) {
      return "button";
    }
    if (IconChooser.class.equals(type)) {
      return "enum";
    }
    if (Icon.class.equals(type)) {
      return "icon";
    }
    if (type.isEnum()) {
      return "enum";
    }
    if (String.class.equals(type)) {
      return "string";
    }
    if (String[].class.equals(type)) {
      return "string[]";
    }
    if (LocalDate.class.equals(type)) {
      return "date";
    }
    if (LocalDateTime.class.equals(type)) {
      return "datetime";
    }
    if (LocalTime.class.equals(type)) {
      return "time";
    }
    if (Integer.class.equals(type)) {
      return "int";
    }
    if (Double.class.equals(type)) {
      return "double";
    }
    if (BigDecimal.class.equals(type)) {
      return "double";
    }
    if (Float.class.equals(type)) {
      return "float";
    }
    if (Boolean.class.equals(type)) {
      return "boolean";
    }
    if (Long.class.equals(type) || Double.class.equals(type)) {
      return type.getSimpleName().toLowerCase();
    }
    if (java.io.File.class.equals(type)) {
      return "file";
    }
    if (TelephoneNumber.class.equals(type)) {
      return "telephone";
    }
    if (type.isArray()) {
      if (type.getComponentType().isEnum()) {
        return "enum[]";
      }
    }
    if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {
      if (!field.isAnnotationPresent(UseCrud.class)) {
        return ExternalReference.class.getSimpleName() + "[]";
      }
    }
    if (Collection.class.isAssignableFrom(type)) {
      String value = field.getGenericClass().getSimpleName().toLowerCase();
      if (Integer.class.equals(field.getGenericClass())) {
        value = "int";
      }
      if (ExternalReference.class.equals(field.getGenericClass())) {
        value = ExternalReference.class.getSimpleName();
      }
      if (field.getGenericClass().isEnum()) {
        value = "enum";
      }
      return value + "[]";
    }
    if (field.isAnnotationPresent(ManyToOne.class)) {
      return ExternalReference.class.getSimpleName();
    }

    return type.getSimpleName();
  }

  public String mapColumnType(Field field) {
    if (field.isAnnotationPresent(Money.class)) {
      return "money";
    }
    if (field.isAnnotationPresent(Status.class)) {
      return StatusDto.class.getSimpleName();
    }
    return mapFieldType(field);
  }

  public String getWidth(Field field) {
    if (field.isAnnotationPresent(Width.class)) {
      return field.getAnnotation(Width.class).value();
    }
    return null;
  }
}
