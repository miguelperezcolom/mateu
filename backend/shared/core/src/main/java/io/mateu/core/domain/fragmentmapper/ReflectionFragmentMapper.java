package io.mateu.core.domain.fragmentmapper;

import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.mapAppToFragment;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionFormMapper.mapFormToFragment;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionObjectMapper.mapObjectToFragment;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;

@Named
public class ReflectionFragmentMapper implements FragmentMapper {

  @Override
  public UIFragmentDto mapToFragment(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof UIFragmentDto uiFragmentDto) {
      return uiFragmentDto;
    }
    if (instance instanceof Form form) {
      return mapFormToFragment(form, baseUrl, initiatorComponentId, httpRequest);
    }
    if (instance instanceof App app) {
      return mapAppToFragment(app, baseUrl, route, initiatorComponentId, httpRequest);
    }
    return mapObjectToFragment(instance, baseUrl, initiatorComponentId, httpRequest);
  }
}
