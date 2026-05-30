package io.mateu.core.infra.reflection;

import static io.mateu.core.infra.reflection.FragmentDataSerializer.serializeData;

import io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.domain.out.fragmentmapper.ComponentFragmentMapper;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.AppData;
import io.mateu.uidl.data.AppState;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.net.URL;
import java.util.Collection;
import java.util.List;

final class FragmentListMapper {

  static List<UIFragmentDto> mapToFragments(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      ComponentFragmentMapper componentFragmentMapper,
      ReflectionObjectToComponentMapper reflectionFragmentMapper) {
    if (instance instanceof UIFragmentDto uiFragmentDto) {
      return List.of(uiFragmentDto);
    }
    if (instance instanceof AppState
        || instance instanceof AppData
        || instance instanceof Message
        || instance instanceof UICommand
        || instance instanceof URI
        || instance instanceof URL) {
      return List.of();
    }
    var effectiveId = getInitiatorComponentId(initiatorComponentId, httpRequest);
    if (instance instanceof Collection<?> collection) {
      return collection.stream()
          .filter(
              object ->
                  !(object instanceof AppState)
                      && !(object instanceof AppData)
                      && !(object instanceof Message)
                      && !(object instanceof UICommand)
                      && !(object instanceof URI)
                      && !(object instanceof URL))
          .map(
              object -> {
                if (object instanceof UIFragmentDto dto) {
                  return dto;
                }
                return serializeData(
                    componentFragmentMapper.mapToFragment(
                        reflectionFragmentMapper.mapToComponent(
                            object, baseUrl, route, consumedRoute, effectiveId, httpRequest),
                        baseUrl,
                        route,
                        consumedRoute,
                        effectiveId,
                        httpRequest));
              })
          .toList();
    }
    return List.of(
        serializeData(
            componentFragmentMapper.mapToFragment(
                reflectionFragmentMapper.mapToComponent(
                    instance, baseUrl, route, consumedRoute, effectiveId, httpRequest),
                baseUrl,
                route,
                consumedRoute,
                effectiveId,
                httpRequest)));
  }

  private static String getInitiatorComponentId(
      String initiatorComponentId, HttpRequest httpRequest) {
    if (httpRequest.getAttribute("initiatorComponentId") != null) {
      return (String) httpRequest.getAttribute("initiatorComponentId");
    }
    return initiatorComponentId;
  }

  private FragmentListMapper() {}
}
