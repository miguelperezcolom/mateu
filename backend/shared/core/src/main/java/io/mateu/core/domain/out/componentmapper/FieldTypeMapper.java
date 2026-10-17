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

  /**
   * The type the field HOLDS: an {@code Optional<X>} field is a field of type X (its content is
   * shown, an empty Optional is an empty field).
   */
  private static Class<?> typeOf(Field field) {
    return io.mateu.core.infra.reflection.OptionalFields.valueType(field);
  }

  public static FieldDataType getDataType(Field field) {
    // A field explicitly flagged as money (via @Stereotype(money)) that is shown read-only
    // (plain text) keeps the dense plain-text rendering but is tagged as money so the
    // front-end formats the number as a currency amount.
    if (isMoneyStereotype(field) && isPlainTextContext(field)) {
      return FieldDataType.money;
    }
    if (String.class.equals(typeOf(field))) {
      return FieldDataType.string;
    }
    if (boolean.class.equals(typeOf(field)) || Boolean.class.equals(typeOf(field))) {
      return FieldDataType.bool;
    }
    if (int.class.equals(typeOf(field))
        || Integer.class.equals(typeOf(field))
        || long.class.equals(typeOf(field))
        || Long.class.equals(typeOf(field))
        || BigInteger.class.equals(typeOf(field))) {
      return FieldDataType.integer;
    }
    if (float.class.equals(typeOf(field))
        || Float.class.equals(typeOf(field))
        || double.class.equals(typeOf(field))
        || Double.class.equals(typeOf(field))
        || BigDecimal.class.equals(typeOf(field))) {
      return FieldDataType.number;
    }
    if (LocalDate.class.equals(typeOf(field))) {
      return FieldDataType.date;
    }
    if (LocalDateTime.class.equals(typeOf(field))
        || Date.class.equals(typeOf(field))
        || ZonedDateTime.class.equals(typeOf(field))
        || java.sql.Date.class.equals(typeOf(field))) {
      return FieldDataType.dateTime;
    }
    if (LocalTime.class.equals(typeOf(field))) {
      return FieldDataType.time;
    }
    if (typeOf(field).isArray() || Collection.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.array;
    }
    if (typeOf(field).isEnum()) {
      return FieldDataType.string;
    }
    if (File.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.file;
    }
    if (Amount.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.money;
    }
    if (Status.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.status;
    }
    if (ComponentDto.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.component;
    }
    if (Component.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.component;
    }
    if (Menu.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.menu;
    }
    if (Range.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.range;
    }
    if (ColumnActionGroup.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.actionGroup;
    }
    if (ColumnAction.class.isAssignableFrom(typeOf(field))) {
      return FieldDataType.action;
    }
    return FieldDataType.string;
  }

  public static FieldDataType getDataTypeForColumn(Field columnField) {
    return ColumnTypeMapper.getDataTypeForColumn(columnField);
  }

  public static FieldDataType getDataTypeForListingColumn(Field columnField) {
    return ColumnTypeMapper.getDataTypeForListingColumn(columnField);
  }

  public static FieldStereotype getStereotype(Field field) {
    if (MetaAnnotations.isPresent(field, PlainText.class)) {
      return FieldStereotype.plainText;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Badge.class)) {
      return FieldStereotype.badge;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.BulletedList.class)) {
      return FieldStereotype.bulletedList;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.UploadableImage.class)) {
      return FieldStereotype.uploadableImage;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.FileUpload.class)) {
      return FieldStereotype.fileUpload;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.TreeSelect.class)) {
      return FieldStereotype.treeSelect;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Signature.class)) {
      return FieldStereotype.signature;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.PhotoCapture.class)) {
      return FieldStereotype.camera;
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
        && (String.class.equals(typeOf(field))
            || boolean.class.equals(typeOf(field))
            || Boolean.class.equals(typeOf(field))
            || int.class.equals(typeOf(field))
            || Integer.class.equals(typeOf(field))
            || long.class.equals(typeOf(field))
            || Long.class.equals(typeOf(field))
            || BigInteger.class.equals(typeOf(field))
            || float.class.equals(typeOf(field))
            || Float.class.equals(typeOf(field))
            || double.class.equals(typeOf(field))
            || Double.class.equals(typeOf(field))
            || BigDecimal.class.equals(typeOf(field))
            || LocalDate.class.equals(typeOf(field))
            || LocalDateTime.class.equals(typeOf(field))
            || LocalTime.class.equals(typeOf(field))
            || Date.class.equals(typeOf(field))
            || ZonedDateTime.class.equals(typeOf(field))
            || java.sql.Date.class.equals(typeOf(field))
            || typeOf(field).isEnum())) {
      return FieldStereotype.plainText;
    }
    if (typeOf(field).isEnum()) {
      if (MetaAnnotations.isPresent(field, UseRadioButtons.class)
          || LayoutInference.preferRadio(field)) {
        return FieldStereotype.radio;
      }
      return FieldStereotype.select;
    }
    if (ChoiceCollections.elementEnum(field) != null) {
      // a List/Set of enum constants with no stereotype: pick several (ChoiceCollections)
      return FieldStereotype.multiSelect;
    }
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.RestOptions.class)) {
      // options fetched client-side from an arbitrary REST endpoint → a select
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
    if (Amount.class.equals(typeOf(field))) {
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

  public static String getCaptionPathForColumn(Field columnField) {
    return ColumnTypeMapper.getCaptionPathForColumn(columnField);
  }

  public static String getLeadingPathForColumn(Field columnField) {
    return ColumnTypeMapper.getLeadingPathForColumn(columnField);
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
