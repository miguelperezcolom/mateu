package io.mateu.core.domain.fragmentmapper;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentAppMapper.mapAppToFragment;
import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentPageMapper.mapPageToFragment;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.PageSupplier;
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

    if (instance instanceof AppSupplier appSupplier) {
      return mapAppToFragment(
          appSupplier,
          appSupplier.getApp(httpRequest),
          baseUrl,
          route,
          initiatorComponentId,
          httpRequest);
    }

    if (instance instanceof PageSupplier pageSupplier) {
      return mapPageToFragment(
          pageSupplier,
          pageSupplier.getPage(httpRequest),
          baseUrl,
          route,
          initiatorComponentId,
          httpRequest);
    }

    return instance;
  }
}
