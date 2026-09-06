package io.mateu.core.infra.reflection;

import static io.mateu.core.domain.out.CommandMapper.mapToCommandDtos;
import static io.mateu.core.domain.out.MessageMapper.mapToAppendBanners;
import static io.mateu.core.domain.out.MessageMapper.mapToBannerDtos;
import static io.mateu.core.domain.out.MessageMapper.mapToMessageDtos;

import io.mateu.core.domain.out.UiIncrementMapper;
import io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.domain.out.fragmentmapper.ComponentFragmentMapper;
import io.mateu.dtos.BannerDto;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.AppData;
import io.mateu.uidl.data.AppState;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MapsToDto;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.util.List;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ReflectionUiIncrementMapper implements UiIncrementMapper {

  private final ComponentFragmentMapper componentFragmentMapper;
  private final ReflectionObjectToComponentMapper reflectionFragmentMapper;

  @Override
  public boolean supports(Object instance) {
    return true;
  }

  @Override
  // todo: add metadata from the method annotations
  public Mono<UIIncrementDto> map(
      Object instance,
      String baseUrl,
      String rawRoute,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var route = removeQueryParamsFromRoute(rawRoute);
    if (instance == null) {
      return Mono.empty();
    }
    if (instance instanceof UIIncrementDto uiIncrementDto) {
      return Mono.just(uiIncrementDto);
    }
    if (instance instanceof MapsToDto mapsToDto) {
      return Mono.just(mapsToDto.toUIIncrementDto());
    }
    if (instance instanceof Mono<?> mono) {
      return mono.flatMap(
          object -> map(object, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest));
    }
    // A domain object with a registered ComponentAdapter is bridged into the supplier interfaces so
    // the adapter's components + state + data flow through the rest of the pipeline unchanged.
    var adapter = io.mateu.core.infra.adapters.AdapterRegistry.find(instance.getClass());
    if (adapter != null) {
      instance = new io.mateu.core.infra.adapters.AdaptedComponentTree(instance, adapter);
    }
    // Page-level inference (@AutoPage): a plain class whose structure spells an archetype is
    // bridged into it, same substitution pattern as the adapter above.
    else if (io.mateu.core.domain.out.componentmapper.PageInference.composesDashboard(
        instance.getClass())) {
      instance =
          new io.mateu.core.infra.declarative.orchestrators.dashboard.InferredDashboard(instance);
    } else if (io.mateu.core.domain.out.componentmapper.PageInference.composesWelcome(
        instance.getClass())) {
      instance =
          new io.mateu.core.infra.declarative.orchestrators.welcome.InferredWelcome(instance);
    }
    var fragments =
        mapToFragments(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    return Mono.just(
        new UIIncrementDto(
            mapToCommands(instance, baseUrl, httpRequest),
            mapToMessages(instance, baseUrl, httpRequest),
            fragments,
            mapToBanners(instance, baseUrl, httpRequest),
            mapToAppendBanners(instance),
            mapToAppData(instance, baseUrl, httpRequest),
            mapToAppState(instance, baseUrl, httpRequest)));
  }

  public static String removeQueryParamsFromRoute(String rawRoute) {
    var route = rawRoute.contains("?") ? rawRoute.substring(0, rawRoute.indexOf("?")) : rawRoute;
    if ("/".equals(route)) {
      route = "";
    }
    return route;
  }

  private Object mapToAppData(Object instance, String baseUrl, HttpRequest httpRequest) {
    if (instance instanceof AppData appData) {
      return appData.data();
    }
    return null;
  }

  private Object mapToAppState(Object instance, String baseUrl, HttpRequest httpRequest) {
    if (instance instanceof AppState appState) {
      return appState.state();
    }
    // A route may seed the app state (stashed during resolution). Emit it MERGED UNDER the client's
    // request app state so the route's values are defaults and the persisted @AppContext still wins
    // — the client replaces its store with what we return, so it must carry the client's values
    // too.
    if (httpRequest != null
        && httpRequest.getAttribute("_routeAppState") instanceof java.util.Map<?, ?> seeds
        && !seeds.isEmpty()) {
      var merged = new java.util.LinkedHashMap<String, Object>();
      seeds.forEach((key, value) -> merged.put(String.valueOf(key), value));
      try {
        var rq = httpRequest.runActionRq();
        if (rq != null && rq.appState() != null) {
          merged.putAll(rq.appState());
        }
      } catch (Exception ignored) {
        // no run-action request in hand (e.g. a bare index load): the seeds stand alone
      }
      return merged;
    }
    return null;
  }

  private List<UICommandDto> mapToCommands(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    return mapToCommandDtos(instance, baseUrl, httpRequest);
  }

  private List<MessageDto> mapToMessages(Object instance, String baseUrl, HttpRequest httpRequest) {
    return mapToMessageDtos(instance, baseUrl, httpRequest);
  }

  private List<BannerDto> mapToBanners(Object instance, String baseUrl, HttpRequest httpRequest) {
    return mapToBannerDtos(instance, baseUrl, httpRequest);
  }

  private List<UIFragmentDto> mapToFragments(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return FragmentListMapper.mapToFragments(
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        componentFragmentMapper,
        reflectionFragmentMapper);
  }
}
