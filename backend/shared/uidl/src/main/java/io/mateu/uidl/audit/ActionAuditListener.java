package io.mateu.uidl.audit;

import io.mateu.uidl.annotations.Experimental;

/**
 * Hears every Mateu request once it has ended — the hook for an audit trail. Register any number of
 * beans of this type; each is called with the same {@link ActionAuditEvent}.
 *
 * <p>Called on the thread that finished the request, after its answer: keep it quick (hand the
 * event to a queue when the trail is remote). A listener that throws does not fail the request —
 * Mateu logs it once per listener class and goes on.
 *
 * <p>Mateu ships UI only: it says what happened; where the trail is kept is the application's.
 */
@Experimental
@FunctionalInterface
public interface ActionAuditListener {

  void onAction(ActionAuditEvent event);
}
