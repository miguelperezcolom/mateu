package io.mateu.core.domain;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.mapActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.EmitsMapper.emitsName;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.mapRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.mapValidations;
import static io.mateu.core.infra.declarative.FormViewModel.toMap;
import static io.mateu.core.infra.declarative.orchestrators.wizard.Wizard.addRowNumber;

import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.core.domain.out.componentmapper.StaticViewResolver;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StateSupplier;
import java.util.*;

/**
 * Static helpers for building the {@link ServerSideComponentDto} of a model view and extracting its
 * state — what every mapper and action runner needs, so it lives on the domain side (it used to be
 * reached through the application layer's {@code RunActionUseCase} / {@code ComponentStateHelper},
 * which remain as deprecated delegates).
 */
public final class ComponentState {

  private ComponentState() {}

  /** Records the route the request resolved to ({@code resolvedRoute} attribute). */
  public static void setResolvedRoute(HttpRequest httpRequest, String route) {
    setResolvedRoute(httpRequest, route, true);
  }

  /** Records the resolved route; unless {@code force}, only when none was recorded yet. */
  public static void setResolvedRoute(HttpRequest httpRequest, String route, boolean force) {
    if (force || httpRequest.getAttribute("resolvedRoute") == null) {
      httpRequest.setAttribute("resolvedRoute", route);
    }
  }

  /** Records the path the request resolved to ({@code resolvedPath} attribute). */
  public static void setResolvedPath(HttpRequest httpRequest, String path) {
    httpRequest.setAttribute("resolvedPath", path);
  }

  public static ServerSideComponentDto wrap(
      Component component,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return wrap(
        List.of(component),
        modelView,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest);
  }

  /**
   * The type name the client will send back for this component.
   *
   * <p>Almost always the model view's own class, but an orchestrator that STANDS IN for another
   * class says so: the capability bridge is built around a listing and cannot be rebuilt from its
   * own name — doing that produced a bridge with nothing behind it, and the listing's first search
   * died with a NullPointerException on the missing target. The name that travels has to be the one
   * the server can turn back into a working instance.
   */
  private static String serverSideTypeOf(Object modelView) {
    var type =
        modelView instanceof io.mateu.uidl.interfaces.ComponentTreeSupplier supplier
            ? supplier.serverSideType()
            : modelView.getClass().getName();
    // the client will name it back: remember that this process handed it out
    io.mateu.core.application.security.WireTypes.emitted(type);
    return type;
  }

  public static ServerSideComponentDto wrap(
      List<Component> components,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        httpRequest.getAttribute("upstreamComponentId") != null
            ? httpRequest.getAttribute("upstreamComponentId").toString()
            : UUID.randomUUID().toString(),
        serverSideTypeOf(modelView),
        consumedRoute,
        components.stream()
            .map(
                component ->
                    mapComponentToDto(
                        null,
                        component,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest))
            .toList(),
        getState(modelView, httpRequest),
        "width: 100%;",
        "",
        mapActions(modelView, httpRequest),
        mapTriggers(modelView, httpRequest),
        mapRules(modelView, httpRequest),
        mapValidations(modelView, route, httpRequest),
        null,
        null,
        false,
        emitsName(modelView),
        PageWidthResolver.wirePageWidth(modelView),
        PageTypeResolver.wirePageType(modelView),
        StaticViewResolver.isStatic(modelView),
        null);
  }

  public static Object getState(Object modelView, HttpRequest httpRequest) {
    if (modelView == null) {
      return null;
    }
    var state =
        (modelView instanceof StateSupplier stateSupplier)
            ? stateSupplier.state(httpRequest)
            : modelView;
    if (!(state instanceof Map<?, ?>)) {
      var newState = toMap(state);
      GeneratedValueInitializer.initialize(
          getViewModelClass(modelView, httpRequest), newState, httpRequest);
      addRowNumber(modelView.getClass(), newState);
      return stripRestricted(state, newState, httpRequest);
    }
    return state;
  }

  /**
   * A field the caller may not see ({@code @EyesOnly}) must not travel in the state either: hiding
   * the input while sending its value in {@code initialData} would leak exactly what the annotation
   * protects — at any depth (a nested form's restricted field too), and the fields a YAML layout
   * bound to this view model hides from the caller ({@code eyesOnly:}).
   */
  @SuppressWarnings("unchecked")
  private static Object stripRestricted(Object source, Object state, HttpRequest httpRequest) {
    if (source == null || !(state instanceof Map<?, ?> map)) {
      return state;
    }
    var readable =
        io.mateu.core.domain.FieldAccess.readable(
            source.getClass(), (Map<String, Object>) map, httpRequest);
    var hidden = yamlHidden(source, httpRequest);
    if (hidden.isEmpty() || hidden.stream().noneMatch(readable::containsKey)) {
      return readable;
    }
    var out = new LinkedHashMap<>(readable);
    hidden.forEach(out::remove);
    return out;
  }

  /**
   * Request attribute: view model class name → the fields the YAML layout it is drawn with hides
   * from the caller (set by the YAML guard, see {@code YamlUidlLoader}).
   */
  public static final String YAML_HIDDEN_ATTRIBUTE = "mateu.yamlHiddenFields";

  @SuppressWarnings("unchecked")
  private static java.util.Set<String> yamlHidden(Object source, HttpRequest httpRequest) {
    if (httpRequest == null
        || !(httpRequest.getAttribute(YAML_HIDDEN_ATTRIBUTE) instanceof Map<?, ?> byType)) {
      return java.util.Set.of();
    }
    var hidden = byType.get(source.getClass().getName());
    return hidden instanceof java.util.Set<?> set
        ? (java.util.Set<String>) set
        : java.util.Set.of();
  }

  /**
   * The instance itself when the caller may see all of it; otherwise its state as a map WITHOUT the
   * fields hidden from this caller — for the places that hand the raw instance to the wire as state
   * / initial data.
   */
  public static Object withoutRestricted(Object instance, HttpRequest httpRequest) {
    if (instance == null || instance instanceof Map<?, ?>) {
      return instance;
    }
    if (!io.mateu.core.domain.FieldAccess.isGuarded(instance.getClass())
        && yamlHidden(instance, httpRequest).isEmpty()) {
      return instance;
    }
    var map = new LinkedHashMap<>(toMap(instance));
    var stripped = stripRestricted(instance, map, httpRequest);
    return stripped == map ? instance : stripped;
  }

  public static String getAppRoute(Object potentialApp) {
    if (potentialApp.getClass().isAnnotationPresent(UI.class)) {
      return potentialApp.getClass().getAnnotation(UI.class).value();
    }
    return "";
  }
}
