package io.mateu.core.infra.declarative.orchestrators;

import io.mateu.uidl.annotations.Internal;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Where a crud's routed record page ({@code view}, {@code edit}, {@code new}) lives on the client:
 * its component id and consumed route, carried in the page's own state.
 *
 * <p>The page's buttons (an editor's {@code @Button}, a {@code @ViewToolbarButton}) bubble to an
 * ancestor, and the request names THAT ancestor (its id as {@code initiatorComponentId}), with the
 * page's state as {@code parameters.initiatorState}. The ancestor depends on how the crud is hosted
 * — its app's home (the crud's own mediator), a menu entry of another app (the app itself), … — and
 * the page's id cannot be derived from it: deriving it ({@code "ux_" + ancestor − "_app" +
 * "_cs_edit"}) only matched the first shape, so in an app with a menu the answer targeted a
 * component that does not exist and the form never showed it. The page's state travels with every
 * one of those actions, so the page says itself where it is.
 */
@Internal
public final class RoutedPage {

  /** The page's component id, in its state. */
  public static final String ID_KEY = "_pageId";

  /** The page's consumed route, in its state. */
  public static final String ROUTE_KEY = "_pageRoute";

  private RoutedPage() {}

  /** The routed views whose page carries its whereabouts. */
  static boolean tracks(String viewName) {
    return "view".equals(viewName) || "edit".equals(viewName) || "new".equals(viewName);
  }

  /** The page state with its id and route added (a copy: the original may be the user's map). */
  @SuppressWarnings("unchecked")
  static Object stamp(Object state, String pageId, String consumedRoute) {
    if (state != null && !(state instanceof Map<?, ?>)) {
      return state;
    }
    var stamped = new LinkedHashMap<String, Object>();
    if (state != null) {
      stamped.putAll((Map<String, Object>) state);
    }
    stamped.put(ID_KEY, pageId);
    stamped.put(ROUTE_KEY, consumedRoute);
    return stamped;
  }

  /** The id of the routed page that sent this action, or null when the page did not say. */
  public static String id(HttpRequest httpRequest) {
    return read(httpRequest, ID_KEY);
  }

  /** The consumed route of the routed page that sent this action, or null. */
  public static String route(HttpRequest httpRequest) {
    return read(httpRequest, ROUTE_KEY);
  }

  /** The state without the page's whereabouts — what the app's own code reads. */
  public static Map<String, Object> without(Map<String, Object> state) {
    if (state == null || (!state.containsKey(ID_KEY) && !state.containsKey(ROUTE_KEY))) {
      return state;
    }
    var clean = new LinkedHashMap<>(state);
    clean.remove(ID_KEY);
    clean.remove(ROUTE_KEY);
    return clean;
  }

  private static String read(HttpRequest httpRequest, String key) {
    var rq = httpRequest.runActionRq();
    if (rq == null) {
      return null;
    }
    if (rq.parameters() != null && rq.parameters().get("initiatorState") instanceof Map<?, ?> s) {
      return s.get(key) instanceof String value && !value.isEmpty() ? value : null;
    }
    // a direct (non-bubbled) action carries the page's state as the component state
    return rq.componentState() != null && rq.componentState().get(key) instanceof String value
        ? value
        : null;
  }
}
