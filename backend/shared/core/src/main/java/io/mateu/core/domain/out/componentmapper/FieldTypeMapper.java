package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Range;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StereotypeSupplier;
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

public class FieldTypeMapper {

  public static FieldDataType getDataType(Field field) {
    // A field explicitly flagged as money (via @Stereotype(money)) that is shown read-only
    // (plain text) keeps the dense plain-text rendering but is tagged as money so the
    // front-end formats the number as a currency amount.
    if (isMoneyStereotype(field) && isPlainTextContext(field)) {
      return FieldDataType.money;
    }
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
    if (field.getType().isEnum()) {
      return FieldDataType.string;
    }
    if (File.class.isAssignableFrom(field.getType())) {
      return FieldDataType.file;
    }
    if (Amount.class.isAssignableFrom(field.getType())) {
      return FieldDataType.money;
    }
    if (Status.class.isAssignableFrom(field.getType())) {
      return FieldDataType.status;
    }
    if (ComponentDto.class.isAssignableFrom(field.getType())) {
      return FieldDataType.component;
    }
    if (Component.class.isAssignableFrom(field.getType())) {
      return FieldDataType.component;
    }
    if (Menu.class.isAssignableFrom(field.getType())) {
      return FieldDataType.menu;
    }
    if (Range.class.isAssignableFrom(field.getType())) {
      return FieldDataType.range;
    }
    if (ColumnActionGroup.class.isAssignableFrom(field.getType())) {
      return FieldDataType.actionGroup;
    }
    if (ColumnAction.class.isAssignableFrom(field.getType())) {
      return FieldDataType.action;
    }
    return FieldDataType.string;
  }

  public static FieldDataType getDataTypeForColumn(Field columnField) {
    return ColumnTypeMapper.getDataTypeForColumn(columnField);
  }

  public static FieldStereotype getStereotype(Field field) {
    if (MetaAnnotations.isPresent(field, PlainText.class)) {
      return FieldStereotype.plainText;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Badge.class)) {
      return FieldStereotype.badge;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.UploadableImage.class)) {
      return FieldStereotype.uploadableImage;
    }
    if (MetaAnnotations.isPresent(field, Stereotype.class)) {
      var stereotype = MetaAnnotations.find(field, Stereotype.class).value();
      // A money field in a plain-text class keeps the dense plain-text rendering; the money
      // intent is carried by the data type and the front-end formats the value as currency.
      if (stereotype == FieldStereotype.money && isPlainTextContext(field)) {
        return FieldStereotype.plainText;
      }
      return stereotype;
    }
    if (MetaAnnotations.isPresent(field.getDeclaringClass(), PlainText.class)
        && (String.class.equals(field.getType())
            || boolean.class.equals(field.getType())
            || Boolean.class.equals(field.getType())
            || int.class.equals(field.getType())
            || Integer.class.equals(field.getType())
            || long.class.equals(field.getType())
            || Long.class.equals(field.getType())
            || BigInteger.class.equals(field.getType())
            || float.class.equals(field.getType())
            || Float.class.equals(field.getType())
            || double.class.equals(field.getType())
            || Double.class.equals(field.getType())
            || BigDecimal.class.equals(field.getType())
            || LocalDate.class.equals(field.getType())
            || LocalDateTime.class.equals(field.getType())
            || LocalTime.class.equals(field.getType())
            || Date.class.equals(field.getType())
            || ZonedDateTime.class.equals(field.getType())
            || java.sql.Date.class.equals(field.getType())
            || field.getType().isEnum())) {
      return FieldStereotype.plainText;
    }
    if (field.getType().isEnum()) {
      return FieldStereotype.select;
    }
    if (MetaAnnotations.isPresent(field, Lookup.class)) {
      return FieldStereotype.combobox;
    }
    if (MetaAnnotations.isPresent(field, Searchable.class)) {
      return FieldStereotype.searchable;
    }
    if (MetaAnnotations.isPresent(field, Representation.class)) {
      return MetaAnnotations.find(field, Representation.class).value();
    }
    if (MetaAnnotations.isPresent(field, SliderMin.class)
        || MetaAnnotations.isPresent(field, SliderMax.class)) {
      return FieldStereotype.slider;
    }
    if (Amount.class.equals(field.getType())) {
      return FieldStereotype.money;
    }
    return FieldStereotype.regular;
  }

  public static FieldStereotype getStereotype(
      Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof StereotypeSupplier stereotypeSupplier) {
      var supplied = stereotypeSupplier.stereotype(field.getName(), httpRequest);
      if (supplied != null) {
        return supplied;
      }
    }
    return getStereotype(field);
  }

  public static FieldStereotype getStereotypeForColumn(Field columnField) {
    return ColumnTypeMapper.getStereotypeForColumn(columnField);
  }

  private static boolean isMoneyStereotype(Field field) {
    return MetaAnnotations.isPresent(field, Stereotype.class)
        && MetaAnnotations.find(field, Stereotype.class).value() == FieldStereotype.money;
  }

  private static boolean isPlainTextContext(Field field) {
    return MetaAnnotations.isPresent(field, PlainText.class)
        || MetaAnnotations.isPresent(field.getDeclaringClass(), PlainText.class);
  }
}
