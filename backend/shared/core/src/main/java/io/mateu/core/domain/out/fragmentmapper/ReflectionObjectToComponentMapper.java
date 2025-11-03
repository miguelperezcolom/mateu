package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.mapAppToFragment;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionFormMapper.mapFormToFragment;

import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Page;
import jakarta.inject.Named;

@Named
public class ReflectionObjectToComponentMapper {

  public Object mapToComponent(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (isPage(instance)) {
      return mapFormToFragment(instance, baseUrl, route, initiatorComponentId, httpRequest);
    }
    if (isApp(instance)) {
      return mapAppToFragment(
          instance, instance, baseUrl, route, initiatorComponentId, httpRequest);
    }
    return instance;
  }

  private boolean isApp(Object instance) {
    // no implementa componenttreesupplier
    // no implementa appsupplier
    // tiene anotaciones con @MenuOption o @Submenu?
    // implementa App
    return instance instanceof App;
  }

  private boolean isPage(Object instance) {
    // no implementa componenttreesupplier
    // no implementa appsupplier
    // está anotado con @MateuUI o con @Route
    // implementa Page
    return instance instanceof Page;
  }
}
