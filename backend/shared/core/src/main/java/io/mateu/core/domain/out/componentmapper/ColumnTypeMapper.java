package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.PrimaryColumn;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Status;
import java.lang.reflect.Field;

final class ColumnTypeMapper {

  static FieldDataType getDataTypeForColumn(Field columnField) {
    if (ColumnAction.class.equals(columnField.getType())) {
      return FieldDataType.action;
    }
    if (ColumnActionGroup.class.equals(columnField.getType())) {
      return FieldDataType.actionGroup;
    }
    if (Status.class.equals(columnField.getType())) {
      return FieldDataType.status;
    }
    if (MetaAnnotations.isPresent(columnField, io.mateu.uidl.annotations.Status.class)) {
      return FieldDataType.status;
    }
    if (MetaAnnotations.isPresent(columnField, MappedValue.class)) {
      return FieldDataType.string;
    }
    if (ComponentDto.class.isAssignableFrom(columnField.getType())) {
      return FieldDataType.component;
    }
    if (ColumnAction.class.isAssignableFrom(columnField.getType())) {
      return FieldDataType.action;
    }
    if (boolean.class.equals(columnField.getType())
        || Boolean.class.equals(columnField.getType())) {
      return FieldDataType.bool;
    }
    return FieldDataType.string;
  }

  static FieldStereotype getStereotypeForColumn(Field columnField) {
    // A @PrimaryColumn field is the rich "primary" cell (coherence-plan #6): title + caption +
    // leading. Wins over an explicit @Stereotype so the annotation reads as the whole intent.
    if (MetaAnnotations.isPresent(columnField, PrimaryColumn.class)) {
      return FieldStereotype.primary;
    }
    if (MetaAnnotations.isPresent(columnField, Stereotype.class)) {
      return MetaAnnotations.find(columnField, Stereotype.class).value();
    }
    return FieldStereotype.regular;
  }

  /** The row field a @PrimaryColumn shows as its secondary caption line, or null. */
  static String getCaptionPathForColumn(Field columnField) {
    if (MetaAnnotations.isPresent(columnField, PrimaryColumn.class)) {
      var caption = MetaAnnotations.find(columnField, PrimaryColumn.class).caption();
      return caption != null && !caption.isBlank() ? caption : null;
    }
    return null;
  }

  /** The row field a @PrimaryColumn shows as its leading avatar/icon, or null. */
  static String getLeadingPathForColumn(Field columnField) {
    if (MetaAnnotations.isPresent(columnField, PrimaryColumn.class)) {
      var leading = MetaAnnotations.find(columnField, PrimaryColumn.class).leading();
      return leading != null && !leading.isBlank() ? leading : null;
    }
    return null;
  }

  private ColumnTypeMapper() {}
}
