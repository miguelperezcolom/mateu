package io.mateu.core.domain.act;

import static io.mateu.core.domain.ComponentState.getState;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.createActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FutureComponentMapper.createComponent;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.createRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.createTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.createValidations;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.ServerSideComponent;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import reactor.core.publisher.Flux;

@Named
@Singleton
public class AuditActionRunner implements ActionRunner {

  /**
   * The state key marking the audit dialog's island: its requests come back to the AUDITED view (a
   * type the client may send back and Mateu can rebuild), and this marker tells them apart from the
   * view's own — its {@code search} is the history's, not the crud's listing.
   */
  static final String ISLAND_MARKER = "_mateuAuditHistory";

  /**
   * Whether this runner takes the action: {@code history} on an {@link Auditable}, and the audit
   * dialog's own listing search. Checked BEFORE a view's own action handlers (a crud claims every
   * id — it used to answer {@code history} with "no such action").
   */
  static boolean claims(Object instance, String actionId, HttpRequest httpRequest) {
    if (!(instance instanceof Auditable)) return false;
    if ("history".equals(actionId)) return true;
    return "search".equals(actionId) && isHistoryIsland(httpRequest);
  }

  private static boolean isHistoryIsland(HttpRequest httpRequest) {
    var rq = httpRequest != null ? httpRequest.runActionRq() : null;
    var state = rq != null ? rq.componentState() : null;
    return state != null && Boolean.TRUE.equals(state.get(ISLAND_MARKER));
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return claims(instance, actionId, httpRequest);
  }

  @Override
  public int priority() {
    return 50;
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var listing = new AuditHistoryListing((Auditable) instance);
    var httpRequest = command.httpRequest();
    if (!"history".equals(command.actionId())) {
      // the dialog's listing searching: the history's rows
      return Flux.just(listing.handleAction(command.actionId(), httpRequest));
    }

    var clientSide =
        createComponent(
            listing,
            command.baseUrl(),
            command.route(),
            command.consumedRoute(),
            command.initiatorComponentId(),
            httpRequest);

    var serverSide =
        ServerSideComponent.builder()
            .id(
                httpRequest.getAttribute("upstreamComponentId") != null
                    ? httpRequest.getAttribute("upstreamComponentId").toString()
                    : UUID.randomUUID().toString())
            // the AUDITED view's type, not the internal listing's: the client sends it back with
            // every action of the dialog, and only a type the application exposes (and Mateu can
            // rebuild) is accepted — the listing is rebuilt over the audited view each time
            .serverSideType(auditedType(instance))
            .route(command.consumedRoute())
            .initialData(islandState(listing, httpRequest))
            .style("width: 100%;")
            .cssClasses("")
            .actions(createActions(listing, httpRequest))
            .triggers(createTriggers(listing, httpRequest))
            .rules(createRules(listing, httpRequest))
            .validations(createValidations(listing, command.route(), httpRequest))
            .children(List.of(clientSide))
            .build();

    return Flux.just(
        Dialog.builder()
            .headerTitle("History")
            .width("80vw")
            .height("70vh")
            .resizable(true)
            .content(serverSide)
            .build());
  }

  private static String auditedType(Object instance) {
    return instance instanceof ComponentTreeSupplier tree
        ? tree.serverSideType()
        : instance.getClass().getName();
  }

  private static Map<String, Object> islandState(
      AuditHistoryListing listing, HttpRequest httpRequest) {
    var state = new LinkedHashMap<String, Object>();
    if (getState(listing, httpRequest) instanceof Map<?, ?> initial) {
      initial.forEach((key, value) -> state.put(String.valueOf(key), value));
    }
    state.put(ISLAND_MARKER, true);
    return state;
  }
}
