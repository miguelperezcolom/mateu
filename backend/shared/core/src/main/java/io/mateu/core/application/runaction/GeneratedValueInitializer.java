package io.mateu.core.application.runaction;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.out.fragmentmapper.mappers.DataMapper;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

final class GeneratedValueInitializer {

  static void initialize(
      Class<?> viewModelClass, Map<String, Object> state, HttpRequest httpRequest) {
    if (!Boolean.TRUE.equals(httpRequest.getAttribute("new"))) {
      return;
    }
    getAllFields(viewModelClass).stream()
        .filter(field -> field.isAnnotationPresent(GeneratedValue.class))
        .forEach(
            field -> {
              var generator =
                  MateuBeanProvider.getBean(field.getAnnotation(GeneratedValue.class).value());
              var value = generator.generate();
              if (value != null && List.class.isAssignableFrom(value.getClass())) {
                var list = (List<?>) value;
                var mappedList = list.stream().map(DataMapper::mapItem).toList();
                state.put(field.getName(), mappedList);
              } else {
                state.put(field.getName(), value);
              }
            });
  }

  private GeneratedValueInitializer() {}
}
