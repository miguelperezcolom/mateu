package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ReflectionComponentMapper {

  public static Component mapToComponent(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance == null) return null;
    if (instance instanceof Component component) return component;
    if (instance instanceof List<?> list) {
      return HorizontalLayout.builder()
          .content(
              list.stream()
                  .map(i -> mapToComponent(i, baseUrl, route, initiatorComponentId, httpRequest))
                  .toList())
          .build();
    }
    return Text.builder().text("" + instance).build();
  }
}
