package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getContent;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.reflection.ComponentMapper;
import jakarta.inject.Named;
import java.util.Collection;
import lombok.RequiredArgsConstructor;

@Named
@RequiredArgsConstructor
public class ComponentMapperBean implements ComponentMapper {

  @Override
  public Collection<? extends Component> mapToComponents(
      Object object,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return getContent(object, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }
}
