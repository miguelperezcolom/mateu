package io.mateu.core.application.runaction;

import io.mateu.uidl.data.DeclaredRestSource;
import io.mateu.uidl.data.RestSourceKind;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RestSourceSupplier;
import io.mateu.uidl.interfaces.StateSupplier;
import java.util.List;
import java.util.Map;

/**
 * A definition-only YAML page (no view model) that the ROUTE seeds with state and/or a data source,
 * and that may declare its own actions.
 *
 * <p>A bare {@code spec.layout()} is otherwise mapped as a static component tree with no state and
 * no triggers, so a route that declares {@code data:} (or carries query/path params the page reads
 * as {@code ${state.x}}) had nowhere for those to land — the data-source fetch never fired and the
 * params never reached the state. Wrapping the layout as a {@link ComponentTreeSupplier} + {@link
 * StateSupplier} routes it through the normal mapping, which emits the seeded state and — from the
 * {@code _routeData} the resolver stashed — the synthetic {@code __restdata__} action + OnLoad
 * trigger. The client then fetches the source (its url may interpolate {@code ${state.x}}) and
 * merges the record into the same state, exactly like an {@code @RestData} view.
 *
 * <p>It is also an {@link ActionSupplier}, which is what lets such a page WRITE. The wire has
 * always carried an action's {@code restAction}, and the client has always run it without a round
 * trip; what a page with no Java class lacked was somewhere to declare one. The {@code actions:} of
 * its definition land here, so a {@code Button} naming one calls the endpoint directly.
 */
record SeededYamlPage(
    Component layout,
    Map<String, Object> state,
    List<Action> declaredActions,
    io.mateu.uidl.data.RestSourceCatalog catalog)
    implements ComponentTreeSupplier, StateSupplier, ActionSupplier, RestSourceSupplier {

  SeededYamlPage(Component layout, Map<String, Object> state) {
    this(layout, state, List.of(), io.mateu.uidl.data.RestSourceCatalog.empty());
  }

  SeededYamlPage(Component layout, Map<String, Object> state, List<Action> declaredActions) {
    this(layout, state, declaredActions, io.mateu.uidl.data.RestSourceCatalog.empty());
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return layout;
  }

  @Override
  public Object state(HttpRequest httpRequest) {
    return state;
  }

  @Override
  public List<DeclaredRestSource> declaredRestSources() {
    return declaredActions.stream()
        .filter(action -> action.restAction() != null && action.restAction().source() != null)
        .map(
            action ->
                new DeclaredRestSource(
                    RestSourceKind.ACTION, action.id(), resolved(action.restAction().source())))
        .toList();
  }

  /**
   * The source as the ENDPOINT declares it, not as the surface names it.
   *
   * <p>A surface referencing the catalogue carries nothing but the name, and whether a call is
   * proxied — the very thing the server decides by — lives on the catalogue entry. Handing over the
   * unresolved reference made a proxied write look direct, so the server never advertised the fetch
   * and the click went nowhere. What travels to the browser is still the bare `ref`; this
   * resolution is for the server's own eyes.
   */
  private io.mateu.uidl.data.RestDataSource resolved(io.mateu.uidl.data.RestDataSource source) {
    if (source == null || !source.hasRef() || catalog == null) {
      return source;
    }
    return catalog.get(source.ref()).map(source::resolvedAgainst).orElse(source);
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    // Deliberately NOT the interface's default of a single "*": that wildcard tells the client
    // every
    // action is claimed and dispatched to the server, which is exactly wrong for a page that has no
    // server behind it. A page declaring nothing claims nothing.
    return declaredActions;
  }
}
