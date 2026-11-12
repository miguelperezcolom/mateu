namespace Mateu.Uidl;

// The audit hook — C# analogues of the Java uidl types io.mateu.uidl.audit.*.
// EXPERIMENTAL: may change in a minor release.

/// <summary>How a Mateu request ended: the <c>mateu.outcome</c> of its activity and metrics, and the
/// outcome an <see cref="IActionAuditListener"/> hears. EXPERIMENTAL. (C# analogue of
/// io.mateu.uidl.audit.ActionOutcome.)</summary>
public enum ActionOutcome
{
    /// <summary>The request was answered as asked.</summary>
    Ok,
    /// <summary>Refused with a message meant for the user (a <see cref="UserFacingException"/> or a
    /// validation error).</summary>
    UserError,
    /// <summary>Refused (403): the caller may not see the route or run the action.</summary>
    Forbidden,
    /// <summary>The route, or the record it names, does not exist.</summary>
    NotFound,
    /// <summary>A bug: the user saw "Something went wrong" with a reference id.</summary>
    Error,
}

/// <summary>One Mateu request, as an audit trail needs it: who did what, on which records, when and
/// how it ended. It never carries field values, component state or action parameters.
/// EXPERIMENTAL. (C# analogue of io.mateu.uidl.audit.ActionAuditEvent.)</summary>
/// <param name="Principal">the caller's name, as the host authenticated them (null = anonymous)</param>
/// <param name="Identity">the caller's identity dimensions (the adapter's
/// mapping of <c>HttpContext.User</c>); null = anonymous</param>
/// <param name="Route">the route the request was sent to, as sent</param>
/// <param name="ActionId">the action that ran; empty for a load of the route</param>
/// <param name="View">the full name of the view type the request resolved to (else the server-side
/// type the client named); null when it resolved to nothing</param>
/// <param name="RecordIds">the ids of the records the action acted on, when the CRUD knows them
/// (save, create, delete, restore, update-row); empty otherwise</param>
/// <param name="At">when the request started</param>
/// <param name="DurationMillis">how long it took</param>
/// <param name="Outcome">how it ended</param>
/// <param name="CorrelationId">the request's correlation id (<c>X-Mateu-Correlation-Id</c>, else
/// the trace id)</param>
/// <param name="ErrorReference">the reference the user was shown, for <see cref="ActionOutcome.Error"/></param>
public sealed record ActionAuditEvent(
    string? Principal,
    Identity? Identity,
    string Route,
    string ActionId,
    string? View,
    IReadOnlyList<string> RecordIds,
    DateTimeOffset At,
    long DurationMillis,
    ActionOutcome Outcome,
    string? CorrelationId,
    string? ErrorReference)
{
    /// <summary>Whether the action is Mateu's own plumbing (its id starts with <c>_</c>:
    /// <c>__restfetch__</c>, <c>_keep-alive</c>…) rather than something the user did.</summary>
    public bool ReservedAction => ActionId.StartsWith('_');
}

/// <summary>Hears every Mateu request once it has ended — the hook for an audit trail. Register any
/// number of services of this type; each hears the same event. A listener that throws does not
/// fail the request: Mateu logs it once per listener type and goes on. Keep it quick (hand the
/// event to a queue when the trail is remote). EXPERIMENTAL. (C# analogue of
/// io.mateu.uidl.audit.ActionAuditListener.)</summary>
public interface IActionAuditListener
{
    void OnAction(ActionAuditEvent auditEvent);
}
