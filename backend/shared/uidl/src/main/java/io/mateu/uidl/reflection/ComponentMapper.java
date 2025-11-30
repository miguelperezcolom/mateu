package io.mateu.uidl.reflection;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collection;

public interface ComponentMapper {

  Collection<? extends Component> mapToComponents(
      Object object,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest);
}
