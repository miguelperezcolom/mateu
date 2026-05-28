package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.data.StatusType;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

final class StatusFieldMapper {

  static Object mapStatusValue(Field field, Object item) {
    var ann = field.getAnnotation(Status.class);
    Map<String, StatusType> mapping = new HashMap<>();
    for (StatusMapping statusMapping : ann.mappings()) {
      mapping.put(statusMapping.from(), statusMapping.to());
    }
    StatusType defaultType = ann.defaultStatus();
    var fieldValue = getValue(field, item);
    if (fieldValue == null) return null;
    var value = "" + fieldValue;
    var message = toUpperCaseFirst(value);
    return new io.mateu.uidl.data.Status(mapping.getOrDefault(value, defaultType), message, value);
  }

  private StatusFieldMapper() {}
}
