package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.Widget;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.WidgetSupplier;
import java.util.Collection;
import java.util.Objects;
import lombok.SneakyThrows;

final class AppWidgetExtractor {

  static Collection<? extends Component> getWidgets(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof WidgetSupplier widgetSupplier) {
      return widgetSupplier.widgets(httpRequest);
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Widget.class))
        .map(field -> mapWidget(field, instance, baseUrl, route, initiatorComponentId, httpRequest))
        .filter(Objects::nonNull)
        .toList();
  }

  @SneakyThrows
  private static Component mapWidget(
      java.lang.reflect.Field field,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return mapToComponent(
        getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest);
  }

  private AppWidgetExtractor() {}
}
