package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.ServerSideComponent;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Renders a form field whose type is a routed orchestrator (a {@link MultiView} subclass such as an
 * {@code EditableView} or {@code AutoCrud}) as an embedded mediator sub-app.
 *
 * <p>Instead of treating the orchestrator as a plain nested form, it emits an {@link AppShell} with
 * {@link AppVariant#MEDIATOR}. The frontend mounts an independent {@code <mateu-ux>} bound to the
 * orchestrator's own route and server-side type, so the embedded view loads, routes and toggles
 * (e.g. view ↔ edit) on its own without affecting the host page or sibling sections.
 */
final class EmbeddedOrchestratorFieldBuilder {

  /**
   * Query-string marker appended to an embedded orchestrator's home route so the orchestrator can
   * tell it is running embedded (a mediator inside a host page) rather than as a top-level view.
   * Embedded orchestrators toggle their internal views in place instead of navigating the browser.
   */
  static final String EMBEDDED_MARKER = "_embeddedMediator";

  /**
   * Additional marker (set when the host field carries {@link Inline}) that asks the embedded
   * orchestrator to render without the outer page chrome — no title/subtitle/kpis/badges in the
   * page header and no outlined Card wrapper around a single-section form. Used so the embedded
   * view blends into a host tab/section without duplicate framing.
   */
  static final String INLINE_MARKER = "_inline";

  static boolean isOrchestrator(Class<?> type) {
    return MultiView.class.isAssignableFrom(type);
  }

  /** Whether the current request targets an orchestrator that is embedded in a host page. */
  static boolean isEmbeddedRequest(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    return rq != null && rq.route() != null && rq.route().contains(EMBEDDED_MARKER);
  }

  /**
   * Whether the current request targets an embedded orchestrator that was marked {@link Inline} on
   * the host field — so the inner view should drop its own page chrome and section card.
   */
  public static boolean isInlineRequest(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    if (rq == null) {
      return false;
    }
    if (rq.componentState() != null
        && "true".equals(String.valueOf(rq.componentState().get(INLINE_MARKER)))) {
      return true;
    }
    return (rq.route() != null && rq.route().contains(INLINE_MARKER))
        || (rq.serverSideComponentRoute() != null
            && rq.serverSideComponentRoute().contains(INLINE_MARKER));
  }

  static Component build(
      String prefix,
      Field field,
      Object hostInstance,
      String initiatorComponentId,
      HttpRequest httpRequest,
      int maxColumns) {
    var type = field.getType();
    var route = routeOf(type);
    var baseUrl = (String) httpRequest.getAttribute("baseUrl");
    if (baseUrl == null) {
      baseUrl = "";
    }
    var componentId =
        (initiatorComponentId != null ? initiatorComponentId : "")
            + "_"
            + (prefix == null ? "" : prefix)
            + field.getName();
    var inline = MetaAnnotations.isPresent(field, Inline.class);
    var markedRoute = route + (route.contains("?") ? "&" : "?") + EMBEDDED_MARKER + "=1";
    if (inline) {
      markedRoute += "&" + INLINE_MARKER + "=1";
    }
    var app =
        AppShell.builder()
            .clientSideComponentId(componentId + "_app")
            .serverSideType(type.getName())
            .homeServerSideType(type.getName())
            .homeRoute(markedRoute)
            .homeConsumedRoute(route)
            .homeBaseUrl(baseUrl)
            .route(route)
            .variant(AppVariant.MEDIATOR)
            .style("width: 100%;")
            .build();
    Map<String, Object> initialData = new LinkedHashMap<>();
    initialData.put(EMBEDDED_MARKER, true);
    if (inline) {
      initialData.put(INLINE_MARKER, true);
    }
    // Seed the host field VALUE's simple state into the island's initialData (which becomes its
    // componentState), so an orchestrator the host code configured (e.g. `documento.setStayId(id)`)
    // hydrates with that context on its very first render — without events or route params.
    seedInstanceState(field, hostInstance, initialData);
    // Wrap the mediator app in a ServerSideComponent that carries the orchestrator's own actions
    // (edit/save/cancel…). Mirrors the standalone mediator: its component claims those actions, so
    // a
    // toolbar button click is dispatched to the orchestrator instead of bubbling out to the host.
    // The marker travels in serverSideComponentRoute so the orchestrator toggles in place.
    var wrapper =
        ServerSideComponent.builder()
            .id(componentId)
            .serverSideType(type.getName())
            .route(markedRoute)
            .initialData(initialData)
            .actions(orchestratorActions(type, httpRequest))
            .children(List.of(app))
            .style("width: 100%;")
            .build();
    return CustomField.builder()
        .label("")
        .content(wrapper)
        .colspan(maxColumns)
        .style("width: 100%;")
        .build();
  }

  /**
   * Copies the host field value's SIMPLE fields (String/Number/Boolean/enum, non-null) into the
   * island's initialData. Complex members (models, holders) stay behind — the orchestrator loads
   * them itself from the seeded context.
   */
  private static void seedInstanceState(
      Field field, Object hostInstance, Map<String, Object> initialData) {
    if (hostInstance == null || hostInstance instanceof Class) {
      return;
    }
    try {
      var value = io.mateu.core.infra.reflection.read.ValueProvider.getValue(field, hostInstance);
      if (value == null) {
        return;
      }
      for (Field member : value.getClass().getDeclaredFields()) {
        if (java.lang.reflect.Modifier.isStatic(member.getModifiers())) {
          continue;
        }
        var memberType = member.getType();
        var simple =
            String.class.equals(memberType)
                || Number.class.isAssignableFrom(memberType)
                || memberType.isPrimitive()
                || Boolean.class.equals(memberType)
                || memberType.isEnum();
        if (!simple) {
          continue;
        }
        member.setAccessible(true);
        var memberValue = member.get(value);
        if (memberValue != null) {
          initialData.put(
              member.getName(), memberType.isEnum() ? memberValue.toString() : memberValue);
        }
      }
    } catch (Exception ignored) {
      // best effort — an unseedable island still works, it just starts without host context
    }
  }

  /** Best-effort retrieval of the orchestrator's declared actions without rendering it. */
  private static List<Action> orchestratorActions(Class<?> type, HttpRequest httpRequest) {
    try {
      var instance = instantiate(type);
      if (instance instanceof ActionSupplier actionSupplier) {
        return actionSupplier.actions(httpRequest);
      }
    } catch (Exception ignored) {
      // fall through to the wildcard default below
    }
    return List.of(Action.builder().id("*").build());
  }

  private static Object instantiate(Class<?> type) throws Exception {
    try {
      var bean = MateuBeanProvider.getBean(type);
      if (bean != null) {
        return bean;
      }
    } catch (Exception ignored) {
      // not a managed bean — fall back to a plain no-arg instance
    }
    var constructor = type.getDeclaredConstructor();
    constructor.setAccessible(true);
    return constructor.newInstance();
  }

  private static String routeOf(Class<?> type) {
    if (type.isAnnotationPresent(UI.class)) {
      return type.getAnnotation(UI.class).value();
    }
    if (type.isAnnotationPresent(Route.class)) {
      return type.getAnnotation(Route.class).value();
    }
    return "";
  }

  private EmbeddedOrchestratorFieldBuilder() {}
}
