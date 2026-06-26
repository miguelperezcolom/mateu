package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;

/**
 * The result of {@link io.mateu.uidl.interfaces.ComponentAdapter#adapt}: the components to render
 * plus the state and data maps that back them, and the action ids the view exposes (so the bridge
 * can advertise them; an action is only sent to the server if the component claims it).
 */
public record AdaptedView(
    List<Component> components,
    Map<String, Object> state,
    Map<String, Object> data,
    List<String> actions) {

  public AdaptedView {
    state = state != null ? state : Map.of();
    data = data != null ? data : Map.of();
    actions = actions != null ? actions : List.of();
  }

  public static AdaptedView of(
      List<Component> components,
      Map<String, Object> state,
      Map<String, Object> data,
      List<String> actions) {
    return new AdaptedView(components, state, data, actions);
  }

  public static AdaptedView of(
      List<Component> components, Map<String, Object> state, Map<String, Object> data) {
    return new AdaptedView(components, state, data, List.of());
  }

  public static AdaptedView of(
      Component component, Map<String, Object> state, Map<String, Object> data) {
    return of(List.of(component), state, data);
  }

  public static AdaptedView of(
      Component component,
      Map<String, Object> state,
      Map<String, Object> data,
      List<String> actions) {
    return of(List.of(component), state, data, actions);
  }

  public static AdaptedView of(Component component, Map<String, Object> state) {
    return of(component, state, Map.of());
  }

  public static AdaptedView of(
      Component component, Map<String, Object> state, List<String> actions) {
    return of(List.of(component), state, Map.of(), actions);
  }
}
