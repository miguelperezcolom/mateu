package io.mateu.core.infra.declarative.orchestrators.masterdetail;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.uidl.annotations.DetailPart;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.OnCustomEventTrigger;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Reusable master-detail orchestrator. The <b>master</b> pane shows the always-visible fields; a
 * <b>button bar</b> selects one of several <b>detail parts</b> — fields annotated {@link
 * DetailPart} — each shown on demand in the <b>detail</b> pane, without reloading the master.
 *
 * <p>Declare a screen by extending this class, declaring the sections as fields and marking the
 * detail parts with {@link DetailPart}. Lay master and detail side by side with {@code @Zones}
 * (master zone + detail zone); omit {@code @Zones} for a stacked (vertical) layout. Populate the
 * fields in {@link #load}:
 *
 * <pre>{@code
 * @UI("/checkin")
 * @Zones({@Zone(name = "master", width = "60%"), @Zone(name = "detail", width = "40%")})
 * public class CheckIn extends MasterDetailView {
 *     @Section(value = "Reserva", zone = "master") @Inline Reserva reserva = new Reserva();
 *     @DetailPart(label = "Cliente") @Section(zone = "detail") @Inline Cliente cliente = new Cliente();
 *     @DetailPart(label = "Folios")  @Section(zone = "detail") @Inline Folios  folios  = new Folios();
 *     protected void load(HttpRequest r) { ... populate the fields ... }
 * }
 * }</pre>
 *
 * <h2>How the switching works (no framework changes required)</h2>
 *
 * A button is a server action ({@code __md_pick:<key>}) that merely emits a {@code part-selected}
 * event. This orchestrator subscribes to that event (via {@link TriggersSupplier}); because the
 * subscription is attached to the mediator's own container, the resulting {@code State} updates the
 * container's route, so the mediator re-resolves and re-renders the chosen part. A <em>direct</em>
 * toolbar action would instead target the inner content and never re-navigate — the event
 * indirection is what makes a top-level mediator re-render. The selection is encoded in the route
 * ({@code …/__md/<key>}) so it survives across requests and is idempotent under the (double)
 * subscription fire. The master/detail data binds because the sections are fields of this
 * orchestrator (the model-view), so {@code getView}/{@code getState} stay consistent.
 */
public abstract class MasterDetailView extends MultiView
    implements TriggersSupplier, VisibilitySupplier {

  // ── Internal wire protocol ────────────────────────────────────────────────
  private static final String EVENT = "mateu-md:part-selected";
  private static final String RELOAD = "__md_reload";
  private static final String PICK = "__md_pick:";
  private static final String ROUTE_PREFIX = "/__md/";

  // ── Developer API (override) ──────────────────────────────────────────────

  /** Populate the section fields (master + parts). Called on every (re)render. */
  protected abstract void load(HttpRequest httpRequest);

  /** What to show before the user picks a part. Defaults to {@link NoSelection#FIRST}. */
  protected NoSelection noSelection() {
    return NoSelection.FIRST;
  }

  /** Page title. Defaults to the {@code @Title}/class name of this orchestrator. */
  protected String title(HttpRequest httpRequest) {
    return getTitle(this);
  }

  // ── Detail-part reflection ────────────────────────────────────────────────

  private record Part(String fieldName, String key, String label, int order) {}

  private List<Part> detailParts() {
    var parts = new ArrayList<Part>();
    for (var field : allFields(getClass())) {
      var ann = field.getAnnotation(DetailPart.class);
      if (ann != null) {
        var key = ann.key().isBlank() ? field.getName() : ann.key();
        var label = ann.label().isBlank() ? field.getName() : ann.label();
        parts.add(new Part(field.getName(), key, label, ann.order()));
      }
    }
    parts.sort(Comparator.comparingInt(Part::order));
    return parts;
  }

  private static List<Field> allFields(Class<?> type) {
    var fields = new ArrayList<Field>();
    for (var c = type; c != null && c != Object.class; c = c.getSuperclass()) {
      fields.addAll(List.of(c.getDeclaredFields()));
    }
    return fields;
  }

  private String selectedKey(HttpRequest httpRequest, List<Part> parts) {
    var route = httpRequest.runActionRq() != null ? httpRequest.runActionRq().route() : null;
    if (route != null) {
      var idx = route.indexOf(ROUTE_PREFIX);
      if (idx >= 0) {
        var key = route.substring(idx + ROUTE_PREFIX.length());
        for (var sep : new char[] {'?', '/'}) {
          var p = key.indexOf(sep);
          if (p >= 0) {
            key = key.substring(0, p);
          }
        }
        if (!key.isBlank()) {
          return key;
        }
      }
    }
    return noSelection() == NoSelection.FIRST && !parts.isEmpty() ? parts.get(0).key() : null;
  }

  // ── Visibility: hide the non-selected parts ───────────────────────────────

  @Override
  public boolean isHidden(String member, HttpRequest httpRequest) {
    // Hide the MultiView infrastructure members (_route / _componentRoute and their getters).
    if (member.startsWith("_") || member.equals("route") || member.equals("componentRoute")) {
      return true;
    }
    var parts = detailParts();
    var part = parts.stream().filter(p -> p.fieldName().equals(member)).findFirst().orElse(null);
    if (part == null) {
      return false; // master field (or non-section field) — leave to the default rendering
    }
    return !part.key().equals(selectedKey(httpRequest, parts));
  }

  // ── Wiring (subscription + actions) ───────────────────────────────────────

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        OnCustomEventTrigger.builder()
            .eventName(EVENT)
            .actionId(RELOAD)
            .source(SubscriptionSource.DOCUMENT)
            .build());
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var list = new ArrayList<Action>();
    list.add(Action.builder().id(RELOAD).build());
    for (var part : detailParts()) {
      list.add(Action.builder().id(PICK + part.key()).build());
    }
    return list;
  }

  @Override
  public boolean supportsAction(String actionId) {
    return actionId != null && (actionId.equals(RELOAD) || actionId.startsWith(PICK));
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if (actionId != null && actionId.startsWith(PICK)) {
      // Emit the selection as an event; our own subscription (on the mediator container) handles
      // it.
      return UICommand.dispatchEvent(EVENT, Map.of("key", actionId.substring(PICK.length())));
    }
    if (RELOAD.equals(actionId)) {
      var params = httpRequest.runActionRq().parameters();
      var key = params != null && params.get("key") != null ? params.get("key").toString() : "";
      // Encode the selection in the route: idempotent under the double subscription fire, and it
      // persists the selection across requests. Preserve the mount/base route (e.g. the "/:id/…"
      // that loaded the screen) so navigating parts keeps the route params load() relies on.
      setRouteTo(baseRoute(httpRequest) + ROUTE_PREFIX + key);
      return new State(this);
    }
    return null;
  }

  private static String baseRoute(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    String current = "";
    if (rq != null && rq.componentState() != null && rq.componentState().get("_route") != null) {
      current = String.valueOf(rq.componentState().get("_route"));
    }
    var idx = current.indexOf(ROUTE_PREFIX);
    return idx >= 0 ? current.substring(0, idx) : current;
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  @Override
  protected OrchestrationResult resolveInternalRoute(String route, HttpRequest httpRequest) {
    load(httpRequest);
    var parts = detailParts();
    var selectedKey = selectedKey(httpRequest, parts);

    // The orchestrator IS its own model-view: getView renders its @Section fields (non-selected
    // parts hidden via isHidden) and getState carries their data, keeping both consistent.
    var content =
        new ArrayList<Component>(
            getView(
                this,
                "base_url",
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest,
                true,
                false));

    List<UserTrigger> bar = new ArrayList<>();
    for (var part : parts) {
      bar.add(
          Button.builder()
              .label(part.label())
              .actionId(PICK + part.key())
              .style(part.key().equals(selectedKey) ? "font-weight: 700;" : null)
              .build());
    }

    return new OrchestrationResult(
        route,
        this,
        PageView.builder().title(title(httpRequest)).content(content).toolbar(bar).build());
  }
}
