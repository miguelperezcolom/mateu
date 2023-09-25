package io.mateu.remote.domain.metadataBuilders.fields;

import io.mateu.mdd.shared.annotations.UseCrud;
import io.mateu.mdd.shared.annotations.Width;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.data.TelephoneNumber;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import org.springframework.stereotype.Service;

@Service
public class FieldTypeMapper {

  public String mapFieldType(FieldInterfaced field) {
    Class<?> type = field.getType();
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

  public String mapColumnType(FieldInterfaced field) {
    if (field.isAnnotationPresent(io.mateu.mdd.shared.annotations.Status.class)) {
      return io.mateu.remote.dtos.Status.class.getSimpleName();
    }
    return mapFieldType(field);
  }

  public String getWidth(FieldInterfaced fieldInterfaced) {
    if (fieldInterfaced.isAnnotationPresent(Width.class)) {
      return fieldInterfaced.getAnnotation(Width.class).value();
    }
    return "150px";
  }
}
