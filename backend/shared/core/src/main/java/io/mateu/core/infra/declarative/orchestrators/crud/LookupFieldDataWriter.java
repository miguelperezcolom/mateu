package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

final class LookupFieldDataWriter {

  static void writeField(
      Field field,
      Object item,
      LabelSupplier labelSupplier,
      Map<String, Object> data,
      HttpRequest httpRequest) {
    if (Collection.class.isAssignableFrom(field.getType())) {
      var options = new ArrayList<Option>();
      var ids = (Collection<?>) getValue(field, item);
      if (ids != null) {
        ids.forEach(
            id -> {
              var label = labelSupplier.label(field.getName(), id, httpRequest);
              if (label != null) {
                options.add(new Option(id, label));
              }
            });
      }
      if (!options.isEmpty()) {
        data.put(
            field.getName() + "-label",
            options.stream().map(Option::label).collect(Collectors.joining(", ")));
        data.put(field.getName(), new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1, options));
      }
    } else {
      var id = getValue(field, item);
      if (id != null) {
        var label = labelSupplier.label(field.getName(), id, httpRequest);
        if (label != null) {
          data.put(field.getName() + "-label", label);
          data.put(
              field.getName(),
              new io.mateu.uidl.data.Page<>(label, 1, 0, 1, List.of(new Option(id, label))));
        }
      }
    }
  }

  private LookupFieldDataWriter() {}
}
