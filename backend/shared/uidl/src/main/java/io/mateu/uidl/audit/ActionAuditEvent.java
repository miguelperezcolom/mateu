package io.mateu.uidl.audit;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.security.CallerIdentity;
import java.time.Instant;
import java.util.List;
import lombok.Builder;

/**
 * One Mateu request, as an audit trail needs it: who did what, on which records, when and how it
 * ended. It never carries field values, component state or action parameters — what the user typed
 * stays out of the audit trail; an application that needs it reads its own store.
 *
 * @param caller who called, as the host framework authenticated them ({@link
 *     CallerIdentity#anonymous()} when nobody did) — never decoded from a token by Mateu
 * @param route the route the request was sent to, as sent (concrete: {@code /products/42/edit})
 * @param actionId the action that ran; empty for a load of the route
 * @param view the class name of the view the request resolved to (else the server-side type the
 *     client named); null when it resolved to nothing
 * @param recordIds the ids of the records the action acted on, when the CRUD knows them (save,
 *     create, delete, restore, update-row, a bulk {@code @ListToolbarButton} over a selection);
 *     empty otherwise
 * @param at when the request started
 * @param durationMillis how long it took, until its last answer
 * @param outcome how it ended
 * @param correlationId the request's correlation id ({@code X-Mateu-Correlation-Id}, else the W3C
 *     trace id, else a fresh one) — the same id the micro frontends it called received
 * @param errorReference the reference id the user was shown, for {@link ActionOutcome#ERROR}
 */
@Experimental
@Builder
public record ActionAuditEvent(
    CallerIdentity caller,
    String route,
    String actionId,
    String view,
    List<String> recordIds,
    Instant at,
    long durationMillis,
    ActionOutcome outcome,
    String correlationId,
    String errorReference) {

  public ActionAuditEvent {
    caller = caller == null ? CallerIdentity.anonymous() : caller;
    actionId = actionId == null ? "" : actionId;
    recordIds = recordIds == null ? List.of() : List.copyOf(recordIds);
  }

  /**
   * Whether the action is Mateu's own plumbing rather than something the user did: its id starts
   * with {@code _} ({@code __restfetch__}, {@code _keep-alive}, {@code _notifications-list}…). Most
   * audit trails skip these; loads ({@code actionId} empty) are a separate decision.
   */
  public boolean reservedAction() {
    return actionId.startsWith("_");
  }
}
