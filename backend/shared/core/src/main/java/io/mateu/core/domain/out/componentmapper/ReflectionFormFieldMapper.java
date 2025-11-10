package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.Humanizer.capitalize;

import io.mateu.uidl.annotations.Representation;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Range;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.io.File;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Date;

public class ReflectionFormFieldMapper {

  public static FormField getFormField(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return FormField.builder()
        .id(field.getName())
        .label(getLabel(field))
        .dataType(getDataType(field))
        .stereotype(getStereotype(field))
            .required(isRequired(field))

        .build();
  }

    private static boolean isRequired(Field field) {
      return field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class);
    }

    public static FieldStereotype getStereotype(Field field) {
        if (field.isAnnotationPresent(Representation.class)) {
            return field.getAnnotation(Representation.class).value();
        }
      return FieldStereotype.regular;
    }

    public static String getLabel(Field field) {
    return capitalize(field.getName());
  }

  public static FieldDataType getDataType(Field field) {
    /*
    money
           */
    if (String.class.equals(field.getType())) {
      return FieldDataType.string;
    }
    if (boolean.class.equals(field.getType()) || Boolean.class.equals(field.getType())) {
      return FieldDataType.bool;
    }
    if (int.class.equals(field.getType())
        || Integer.class.equals(field.getType())
        || long.class.equals(field.getType())
        || Long.class.equals(field.getType())
        || BigInteger.class.equals(field.getType())) {
      return FieldDataType.integer;
    }
    if (float.class.equals(field.getType())
        || Float.class.equals(field.getType())
        || double.class.equals(field.getType())
        || Double.class.equals(field.getType())
        || BigDecimal.class.equals(field.getType())) {
      return FieldDataType.number;
    }
    if (LocalDate.class.equals(field.getType())) {
      return FieldDataType.date;
    }
    if (LocalDateTime.class.equals(field.getType())
        || Date.class.equals(field.getType())
        || ZonedDateTime.class.equals(field.getType())
        || java.sql.Date.class.equals(field.getType())) {
      return FieldDataType.dateTime;
    }
    if (LocalTime.class.equals(field.getType())) {
      return FieldDataType.time;
    }
    if (field.getType().isArray() || Collection.class.isAssignableFrom(field.getType())) {
      return FieldDataType.array;
    }
    if (File.class.isAssignableFrom(field.getType())) {
      return FieldDataType.file;
    }
    if (Status.class.isAssignableFrom(field.getType())) {
      return FieldDataType.status;
    }
    if (Component.class.isAssignableFrom(field.getType())) {
      return FieldDataType.status;
    }
    if (Menu.class.isAssignableFrom(field.getType())) {
      return FieldDataType.menu;
    }
    if (Range.class.isAssignableFrom(field.getType())) {
      return FieldDataType.range;
    }
    return FieldDataType.string;
  }
}
