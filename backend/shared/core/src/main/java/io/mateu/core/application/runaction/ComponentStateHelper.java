package io.mateu.core.application.runaction;

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
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

/** Static helpers for building ServerSideComponentDto and extracting component/state metadata. */
public class ComponentStateHelper {

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
      stripRestricted(state, newState, httpRequest);
      return newState;
    }
    return state;
  }

  /**
   * A field the caller may not see ({@code @EyesOnly}) must not travel in the state either: hiding
   * the input while sending its value in {@code initialData} would leak exactly what the annotation
   * protects.
   */
  @SuppressWarnings("unchecked")
  private static void stripRestricted(Object source, Object state, HttpRequest httpRequest) {
    if (source == null || !(state instanceof Map<?, ?> map)) {
      return;
    }
    for (var name : restrictedFields(source, httpRequest)) {
      ((Map<String, Object>) map).remove(name);
    }
  }

  /**
   * The instance itself when the caller may see all of it; otherwise its state as a map WITHOUT the
   * fields an {@code @EyesOnly} hides from this caller — for the places that hand the raw instance
   * to the wire as state / initial data.
   */
  public static Object withoutRestricted(Object instance, HttpRequest httpRequest) {
    if (instance == null || instance instanceof Map<?, ?>) {
      return instance;
    }
    var restricted = restrictedFields(instance, httpRequest);
    if (restricted.isEmpty()) {
      return instance;
    }
    var map = new LinkedHashMap<>(toMap(instance));
    restricted.forEach(map::remove);
    return map;
  }

  private static List<String> restrictedFields(Object source, HttpRequest httpRequest) {
    List<String> names = new ArrayList<>();
    for (var field :
        io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields(source.getClass())) {
      var eyesOnly =
          io.mateu.core.infra.reflection.MetaAnnotations.find(
              field, io.mateu.uidl.annotations.EyesOnly.class);
      if (eyesOnly != null
          && !io.mateu.core.domain.Authorizer.isAuthorized(eyesOnly, httpRequest)) {
        names.add(field.getName());
      }
    }
    return names;
  }

  public static String getAppRoute(Object potentialApp) {
    if (potentialApp.getClass().isAnnotationPresent(UI.class)) {
      return potentialApp.getClass().getAnnotation(UI.class).value();
    }
    return "";
  }

  public static Object invoke(Method method, Object instance) {
    try {
      return method.invoke(instance);
    } catch (InvocationTargetException e) {
      // Surface the real exception the method threw, not the reflective wrapper (this is exactly
      // what @SneakyThrows hid behind NoClassDefFoundError: lombok/Lombok when it rethrew).
      var cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException re) {
        throw re;
      }
      if (cause instanceof Error err) {
        throw err;
      }
      throw new RuntimeException(cause);
    } catch (IllegalAccessException e) {
      throw new RuntimeException("Cannot invoke " + method, e);
    }
  }
}
