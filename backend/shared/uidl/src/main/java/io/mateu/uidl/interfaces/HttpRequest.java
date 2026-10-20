package io.mateu.uidl.interfaces;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Framework-agnostic abstraction over the incoming HTTP request that Mateu injects into any action
 * or supplier method that declares it as a parameter. It exposes the request path ({@link #path()},
 * {@link #lastPathItem()}), query parameters, headers and attributes, plus typed accessors over the
 * submitted component state and action parameters — e.g. {@link #getSelectedRows(Class)}, {@link
 * #getClickedRow(Class)}, {@link #getParameters(Class)}, {@link #getComponentState(Class)} and
 * {@link #getInitiatorState(Class)} — each of which reconstructs a strongly-typed object from the
 * request payload.
 */
public interface HttpRequest {

  default String getBaseUrl() {
    return (String) getAttribute("baseUrl");
  }

  default String getUriPrefix() {
    return (String) getAttribute("uriPrefix");
  }

  /**
   * The origin ({@code scheme://host:port}) this server can call ITSELF at, as the adapter knows it
   * from the local socket — never from a request header ({@code Host}, {@code Origin}, {@code
   * X-Forwarded-*} are all the client's to set). Used to resolve a relative federated {@code
   * RemoteMenu} when {@code mateu.self-base-url} is not configured. {@code null} when the adapter
   * cannot tell (the default, and over TLS, where a loopback url would not match the certificate).
   */
  default String getSelfBaseUrl() {
    return null;
  }

  /**
   * The client's address (IP) as the adapter's socket reports it — after whatever forwarded-header
   * handling the host framework itself is configured for, never parsed by Mateu from a request
   * header. {@code null} when the adapter cannot tell (the default). Used to cap the live UI
   * sessions of anonymous callers per address.
   */
  default String getRemoteAddress() {
    return null;
  }

  default RunActionRqDto runActionRq() {
    var value = getAttribute("payload_run_action_rq");
    if (value instanceof Optional<?> optional) {
      return (RunActionRqDto) optional.get();
    }
    return (RunActionRqDto) value;
  }

  default GetUIRqDto getUiRq() {
    var value = getAttribute("payload_get_ui_rq");
    if (value instanceof Optional<?> optional) {
      return (GetUIRqDto) optional.get();
    }
    return (GetUIRqDto) value;
  }

  @io.mateu.uidl.annotations.Internal
  default HttpRequest storeRunActionRqDto(RunActionRqDto runActionRqDto) {
    setAttribute("payload_run_action_rq", runActionRqDto);
    return this;
  }

  @io.mateu.uidl.annotations.Internal
  default HttpRequest storeGetUIRqDto(GetUIRqDto getUIRqDto) {
    setAttribute("payload_get_ui_rq", getUIRqDto);
    return this;
  }

  String getParameterValue(String name);

  List<String> getParameterValues(String name);

  Object getAttribute(String key);

  void setAttribute(String key, Object value);

  default String getString(String key) {
    return (String) runActionRq().componentState().get(key);
  }

  default int getInt(String key) {
    var value = runActionRq().componentState().getOrDefault(key, "0");
    // A key present with a null value (e.g. "page": null) is "no value", not the string "null"
    // that Integer.parseInt rejects; and any JSON number (a Double such as 20.0 included) is read
    // as a number rather than re-parsed from its text.
    if (value == null) {
      return 0;
    }
    if (value instanceof Number number) {
      return number.intValue();
    }
    var stringValue = "" + value;
    if ("".equals(stringValue)) {
      return 0;
    }
    return Integer.parseInt(stringValue);
  }

  default double getDouble(String key) {
    var value = runActionRq().componentState().getOrDefault(key, "0");
    if (value == null) {
      return 0;
    }
    if (value instanceof Number number) {
      return number.doubleValue();
    }
    var stringValue = "" + value;
    if ("".equals(stringValue)) {
      return 0;
    }
    return Double.parseDouble(stringValue);
  }

  default List<Map<String, Object>> getListOfMaps(String key) {
    return (List<Map<String, Object>>) runActionRq().componentState().getOrDefault(key, List.of());
  }

  String getHeaderValue(String key);

  List<String> getHeaderValues(String key);

  default <T> List<T> getSelectedRows(Class<T> rowType) {
    List<Map<String, Object>> selection =
        (List<Map<String, Object>>) runActionRq().componentState().get("crud_selected_items");
    if (selection == null) {
      if (runActionRq().parameters() != null
          && runActionRq().parameters().get("initiatorState") != null) {
        selection =
            (List<Map<String, Object>>)
                ((Map<String, Object>) runActionRq().parameters().get("initiatorState"))
                    .get("crud_selected_items");
      }
    }
    if (selection != null) {
      return selection.stream()
          .map(data -> MateuInstanceFactory.newInstance(rowType, data, this))
          .toList();
    }
    return List.of();
  }

  default <T> List<T> getSelectedRows(String fieldName, Class<T> rowType) {
    return ((List<Map<String, Object>>)
            runActionRq().componentState().getOrDefault(fieldName + "_selected_items", List.of()))
        .stream().map(data -> MateuInstanceFactory.newInstance(rowType, data, this)).toList();
  }

  /**
   * The row the user clicked, as an instance of {@code rowType}. The row reaches the server in one
   * of two shapes, and both are read:
   *
   * <ul>
   *   <li>under the {@code _clickedRow} parameter — a row action ({@code action-on-row-*}), a
   *       {@code @OnRowSelected} click, a selection field's pick;
   *   <li>as the action's own parameters, one per column — what the renderers send when a row is
   *       OPENED (a listing's row click, {@code view}). Without this second shape the method got
   *       {@code null} for a click it was written to handle.
   * </ul>
   *
   * <p>In the second shape only the parameters named like a property of {@code rowType} are taken
   * (never the internal ones: those starting with {@code _}, {@code initiatorState}). Returns
   * {@code null} when the request carries no row, and for a simple type ({@code String}, a
   * number…), which no row converts to.
   */
  default <T> T getClickedRow(Class<T> rowType) {
    var parameters = runActionRq().parameters();
    if (parameters == null) {
      return null;
    }
    var data = parameters.get("_clickedRow");
    if (data instanceof Map<?, ?> row) {
      return MateuInstanceFactory.newInstance(rowType, (Map<String, Object>) row, this);
    }
    if (data != null || rowType == null || isSimpleType(rowType)) {
      return null;
    }
    var looseRow = new java.util.LinkedHashMap<String, Object>();
    parameters.forEach(
        (key, value) -> {
          if (key != null && !key.startsWith("_") && !"initiatorState".equals(key)) {
            looseRow.put(key, value);
          }
        });
    if (Map.class.equals(rowType)) {
      return looseRow.isEmpty() ? null : (T) looseRow;
    }
    // only the parameters that ARE columns of the row: an action's other parameters (a selection,
    // a button's own values) are no row, and must not turn into an empty one
    looseRow.keySet().retainAll(propertyNamesOf(rowType));
    if (looseRow.isEmpty()) {
      return null;
    }
    return MateuInstanceFactory.newInstance(rowType, looseRow, this);
  }

  private static java.util.Set<String> propertyNamesOf(Class<?> type) {
    var names = new java.util.HashSet<String>();
    if (type.isRecord()) {
      for (var component : type.getRecordComponents()) {
        names.add(component.getName());
      }
    }
    for (Class<?> c = type; c != null && c != Object.class; c = c.getSuperclass()) {
      for (var field : c.getDeclaredFields()) {
        if (!java.lang.reflect.Modifier.isStatic(field.getModifiers())) {
          names.add(field.getName());
        }
      }
    }
    return names;
  }

  private static boolean isSimpleType(Class<?> type) {
    return type.isPrimitive()
        || type.isEnum()
        || CharSequence.class.isAssignableFrom(type)
        || Number.class.isAssignableFrom(type)
        || Boolean.class.equals(type)
        || Character.class.equals(type)
        || java.time.temporal.Temporal.class.isAssignableFrom(type)
        || java.util.Date.class.isAssignableFrom(type)
        || Object.class.equals(type);
  }

  default <T> T getParameters(Class<T> rowType) {
    if (runActionRq().parameters() == null) {
      return null;
    }
    if (Map.class.equals(rowType)) {
      return (T) runActionRq().parameters();
    }
    return MateuInstanceFactory.newInstance(rowType, runActionRq().parameters(), this);
  }

  default <T> T getAppState(Class<T> appStateType) {
    return MateuInstanceFactory.newInstance(appStateType, runActionRq().appState(), this);
  }

  /**
   * Value fixed by an application-level context selector ({@code @AppContext} field on the app
   * class), e.g. the active hotel or company. Lives in the app state under the selector's field
   * name and travels with every request; {@code null} when nothing is selected (or on requests that
   * carry no app state).
   */
  default Object appContext(String fieldName) {
    var runActionRq = runActionRq();
    if (runActionRq == null || runActionRq.appState() == null) {
      return null;
    }
    var value = runActionRq.appState().get(fieldName);
    return value instanceof String text && text.isBlank() ? null : value;
  }

  default <T> T getComponentState(Class<T> componentStateType) {
    return MateuInstanceFactory.newInstance(
        componentStateType, runActionRq().componentState(), this);
  }

  /**
   * State of the component that originated a bubbled action. When a nested form/editor bubbles an
   * action up to a parent (e.g. a mediator handling its child's {@code save}), the originating
   * component's own state travels in {@code parameters.initiatorState}. This returns it built into
   * {@code type}, falling back to the regular component state when no bubbling happened.
   */
  @SuppressWarnings("unchecked")
  default <T> T getInitiatorState(Class<T> type) {
    var parameters = runActionRq().parameters();
    if (parameters != null
        && parameters.get("initiatorState") instanceof Map<?, ?> initiatorState) {
      return MateuInstanceFactory.newInstance(type, (Map<String, Object>) initiatorState, this);
    }
    return getComponentState(type);
  }

  String path();

  default String lastPathItem() {
    var items = path().split("/");
    return items[items.length - 1];
  }

  default String penultimatePathItem() {
    var items = path().split("/");
    return items[items.length - 2];
  }

  List<String> getParameterNames();

  /**
   * The principal the HOSTING FRAMEWORK authenticated for this request (Spring Security's {@code
   * Authentication}, a Micronaut {@code Authentication}, a JAX-RS / MicroProfile JWT principal…),
   * or null when it authenticated nobody — or the adapter cannot tell. Mateu derives the caller's
   * roles from it — and from nothing else: Mateu does not authenticate.
   */
  default java.security.Principal getUserPrincipal() {
    return null;
  }
}
