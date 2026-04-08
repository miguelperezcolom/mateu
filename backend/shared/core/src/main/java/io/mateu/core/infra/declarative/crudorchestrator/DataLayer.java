package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.lang.reflect.Field;
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
    if (item instanceof LabelSupplier labelSupplier) {
      getAllFields(item.getClass())
          .forEach(
              field -> {
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
                    data.put(
                        field.getName(), new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1, options));
                  }
                } else {
                  var id = getValue(field, item);
                  if (id != null) {
                    var label = labelSupplier.label(field.getName(), id, httpRequest);
                    if (label != null) {
                      data.put(field.getName() + "-label", label);
                      data.put(
                          field.getName(),
                          new io.mateu.uidl.data.Page<>(
                              label, 1, 0, 1, List.of(new Option(id, label))));
                    }
                  }
                }
              });
    }
    getAllFields(item.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Lookup.class))
        .forEach(
            field -> {
              LabelSupplier labelSupplier = getLabelSupplier(item, field);
              if (Collection.class.isAssignableFrom(field.getType())) {
                var options = new ArrayList<Option>();

                var ids = (Collection<?>) getValue(field, item);
                if (ids != null) {
                  ids.forEach(
                      id -> {
                        var label = labelSupplier.label(field.getName(), id, httpRequest);
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
                  var label = labelSupplier.label(field.getName(), id, httpRequest);
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

  public static LabelSupplier getLabelSupplier(Object instance, Field field) {
    var lookup = field.getAnnotation(Lookup.class);
    if (LabelSupplier.class.equals(lookup.label())) {
      if (instance instanceof LabelSupplier supplier) {
        return supplier;
      }
      return null;
    }
    return MateuBeanProvider.getBean(field.getAnnotation(Lookup.class).label());
  }

  public static LookupOptionsSupplier getLookupOptionsSupplier(Object instance, Field field) {
    var lookup = field.getAnnotation(Lookup.class);
    if (LookupOptionsSupplier.class.equals(lookup.search())) {
      if (instance instanceof LookupOptionsSupplier supplier) {
        return supplier;
      }
      return null;
    }
    return MateuBeanProvider.getBean(field.getAnnotation(Lookup.class).search());
  }
}
