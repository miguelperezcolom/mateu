package io.mateu.core.application.runaction;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StateSupplier;
import java.util.Map;

/**
 * A definition-only YAML page (no view model) that the ROUTE seeds with state and/or a data source.
 *
 * <p>A bare {@code spec.layout()} is otherwise mapped as a static component tree with no state and
 * no triggers, so a route that declares {@code data:} (or carries query/path params the page reads
 * as {@code ${state.x}}) had nowhere for those to land — the data-source fetch never fired and the
 * params never reached the state. Wrapping the layout as a {@link ComponentTreeSupplier} + {@link
 * StateSupplier} routes it through the normal mapping, which emits the seeded state and — from the
 * {@code _routeData} the resolver stashed — the synthetic {@code __restdata__} action + OnLoad
 * trigger. The client then fetches the source (its url may interpolate {@code ${state.x}}) and
 * merges the record into the same state, exactly like an {@code @RestData} view. Only used when the
 * route actually seeds something; a plain static page keeps its bare-layout shape.
 */
record SeededYamlPage(Component layout, Map<String, Object> state)
    implements ComponentTreeSupplier, StateSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return layout;
  }

  @Override
  public Object state(HttpRequest httpRequest) {
    return state;
  }
}
