package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.ValueMapping;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

final class MappedValueFieldMapper {

  static Object mapMappedValue(Field field, Object item) {
    var ann = MetaAnnotations.find(field, MappedValue.class);
    Map<String, String> mapping = new HashMap<>();
    for (ValueMapping statusMapping : ann.mappings()) {
      mapping.put(statusMapping.from(), statusMapping.to());
    }
    String defaultType = ann.defaultValue();
    var value = "" + getValue(field, item);
    return mapping.getOrDefault(value, defaultType);
  }

  private MappedValueFieldMapper() {}
}
