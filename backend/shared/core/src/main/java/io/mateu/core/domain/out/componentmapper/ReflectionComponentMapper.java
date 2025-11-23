package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;

public class ReflectionComponentMapper {

  public static Component mapToComponent(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return Text.builder().text("" + instance).build();
  }

}
