package io.mateu.core.domain.fragmentmapper;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;

@Named
public class ComponentFragmentMapper implements FragmentMapper {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public Object mapToFragment(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {

    if (instance instanceof ComponentTreeSupplier componentTreeSupplier) {
      return mapComponentToFragment(
          componentTreeSupplier, null, baseUrl, route, initiatorComponentId, httpRequest);
    }

    if (instance instanceof Component component) {
      return mapComponentToFragment(
          null, component, baseUrl, route, initiatorComponentId, httpRequest);
    }

    return instance;
  }
}
