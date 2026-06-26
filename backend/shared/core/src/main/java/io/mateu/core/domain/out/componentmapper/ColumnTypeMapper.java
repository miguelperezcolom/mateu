package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.MappedValue;
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
    if (MetaAnnotations.isPresent(columnField, Stereotype.class)) {
      return MetaAnnotations.find(columnField, Stereotype.class).value();
    }
    return FieldStereotype.regular;
  }

  private ColumnTypeMapper() {}
}
