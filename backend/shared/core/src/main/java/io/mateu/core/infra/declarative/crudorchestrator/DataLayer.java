package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class DataLayer {

  public static HttpRequest addData(Object item, HttpRequest httpRequest) {
    if (item == null) {
      return httpRequest;
    }
    var data = createData(item, httpRequest);
    httpRequest.setAttribute("data", data);
    return httpRequest;
  }

  public static HashMap<String, Object> createData(Object item, HttpRequest httpRequest) {
    var data = new HashMap<String, Object>();
    getAllFields(item.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(ForeignKey.class))
        .forEach(
            field -> {
              LabelSupplier labelSupplier =
                  MateuBeanProvider.getBean(field.getAnnotation(ForeignKey.class).label());
              if (Collection.class.isAssignableFrom(field.getType())) {
                var options = new ArrayList<Option>();

                var ids = (Collection<?>) getValue(field, item);
                if (ids != null) {
                  ids.forEach(
                      id -> {
                        var label = labelSupplier.label(id, httpRequest);
                        options.add(new Option(id, label));
                      });
                }
                data.put(
                    field.getName() + "-label",
                    options.stream().map(Option::label).collect(Collectors.joining(", ")));
                data.put(field.getName(), new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1, options));
              } else {
                var id = getValue(field, item);
                if (id != null) {
                  var label = labelSupplier.label(id, httpRequest);
                  data.put(field.getName() + "-label", label);
                  data.put(
                      field.getName(),
                      new io.mateu.uidl.data.Page<>(
                          label, 1, 0, 1, List.of(new Option(id, label))));
                }
              }
            });
    return data;
  }
}
