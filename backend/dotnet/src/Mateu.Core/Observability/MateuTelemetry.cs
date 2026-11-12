using System.Collections.Concurrent;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Text.RegularExpressions;
using Mateu.Uidl;
using Meter = System.Diagnostics.Metrics.Meter;

namespace Mateu.Core.Observability;

/// <summary>Mateu's activities and metrics, the native .NET way: an <see cref="ActivitySource"/> and
/// a <see cref="Meter"/> named <c>Mateu</c>. Nothing is recorded until the app listens — OpenTelemetry
/// .NET with <c>.AddSource("Mateu")</c> / <c>.AddMeter("Mateu")</c>, or any ActivityListener /
/// MeterListener — so an app that does not pays nothing (mirrors Java's
/// io.mateu.core.infra.observability, which uses the OpenTelemetry API).</summary>
public static class MateuTelemetry
{
    /// <summary>The name of the activity source and of the meter.</summary>
    public const string Name = "Mateu";

    internal static readonly ActivitySource Source = new(Name);
    internal static readonly Meter Meter = new(Name);

    internal static readonly Histogram<double> Duration = Meter.CreateHistogram<double>(
        "mateu.request.duration", "s", "Duration of Mateu requests (sync and sse)");

    internal static readonly Counter<long> Errors = Meter.CreateCounter<long>(
        "mateu.request.errors", description: "Mateu requests that ended in an unexpected error");
}

/// <summary>The LOW-CARDINALITY names a request is measured under — the same rules as Java's
/// TelemetryNames: id-like route segments become <c>:id</c>, a load is <c>__load__</c>, refused and
/// not-found requests are measured as <c>_other</c>, at most 1000 (route, action) series.</summary>
internal static class TelemetryNames
{
    public const string Other = "_other";
    public const string Load = "__load__";
    internal const int MaxSeries = 1000;

    private static readonly Regex Numeric = new(@"^-?\d+$", RegexOptions.Compiled);
    private static readonly Regex Uuid = new(
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", RegexOptions.Compiled);
    private static readonly Regex Hex = new("^[0-9a-fA-F]{12,}$", RegexOptions.Compiled);
    private static readonly ConcurrentDictionary<string, byte> Series = new();

    public static string RouteTemplate(string? route)
    {
        if (string.IsNullOrWhiteSpace(route) || route == "_empty") return "/";
        var path = route;
        var query = path.IndexOf('?');
        if (query >= 0) path = path[..query];
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => IdLike(s) ? ":id" : s);
        var template = string.Concat(segments.Select(s => "/" + s));
        return template.Length == 0 ? "/" : template;
    }

    internal static bool IdLike(string segment) =>
        Numeric.IsMatch(segment) || Uuid.IsMatch(segment) || Hex.IsMatch(segment)
        || (segment.Length >= 8 && segment.Any(char.IsDigit)) || segment.Length > 64;

    public static string Action(string? actionId) => string.IsNullOrEmpty(actionId) ? Load : actionId;

    public static (string Route, string Action) MetricKey(string? route, string? actionId, ActionOutcome outcome)
    {
        if (outcome is ActionOutcome.Forbidden or ActionOutcome.NotFound) return (Other, Other);
        var template = RouteTemplate(route);
        var action = Action(actionId);
        if (action.Length > 128) action = Other;
        var key = template + " " + action;
        if (!Series.ContainsKey(key))
        {
            if (Series.Count >= MaxSeries) return (Other, Other);
            Series.TryAdd(key, 0);
        }
        return (template, action);
    }

    internal static void Reset() => Series.Clear();
}

/// <summary>What is known about ONE Mateu request while it runs (the request's async flow carries
/// it): the view it resolved to, how it ended, the records it acted on — never a field value. The
/// adapter begins it, the handler and the CRUD fill it, the adapter ends it: its activity ends, its
/// metrics are recorded and the <see cref="IActionAuditListener"/>s hear it.</summary>
internal sealed class RequestObservation : IDisposable
{
    private const int MaxRecordIds = 1000;
    private static readonly AsyncLocal<RequestObservation?> CurrentSlot = new();
    private static readonly ConcurrentDictionary<Type, byte> FailedListeners = new();

    private readonly long _started = Stopwatch.GetTimestamp();
    private readonly List<string> _recordIds = [];
    private readonly RequestObservation? _previous;
    private bool _ended;

    public DateTimeOffset At { get; } = DateTimeOffset.UtcNow;
    public string Route { get; private set; } = "";
    public string ActionId { get; private set; } = "";
    public string? View { get; set; }
    public ActionOutcome Outcome { get; set; } = ActionOutcome.Ok;
    public string? ErrorType { get; set; }
    public string? ErrorReference { get; set; }
    public string? CorrelationId { get; set; }
    public Activity? Activity { get; }

    private RequestObservation()
    {
        _previous = CurrentSlot.Value;
        // a server activity of the host (ASP.NET Core's) becomes the parent; none → a server span
        Activity = MateuTelemetry.Source.StartActivity("mateu",
            Activity.Current is null ? ActivityKind.Server : ActivityKind.Internal);
        CurrentSlot.Value = this;
    }

    /// <summary>The observation of the request running on this async flow, or null.</summary>
    public static RequestObservation? Current => CurrentSlot.Value;

    /// <summary>Begins observing a request — null when one is already observed on this flow (an
    /// MCP tool call handling a sync request is observed once, by its outer call).</summary>
    public static RequestObservation? Begin() => CurrentSlot.Value is null ? new RequestObservation() : null;

    /// <summary>What the request asked for (route, action, server-side type), once it is read.</summary>
    public void Describe(string? route, string? actionId, string? serverSideType)
    {
        Route = route ?? "";
        ActionId = actionId ?? "";
        if (!string.IsNullOrWhiteSpace(serverSideType)) View ??= serverSideType;
        if (Activity is null) return;
        var template = TelemetryNames.RouteTemplate(Route);
        var action = TelemetryNames.Action(ActionId);
        Activity.DisplayName = "mateu " + (action.Length > 64 ? TelemetryNames.Other : action) + " " + template;
        Activity.SetTag("mateu.route", Route);
        Activity.SetTag("mateu.route.template", template);
        Activity.SetTag("mateu.action", action);
        if (CorrelationId is not null) Activity.SetTag("mateu.correlation_id", CorrelationId);
    }

    public static void Describe(RunActionRqLike rq) =>
        Current?.Describe(rq.Route, rq.ActionId, rq.ServerSideType);

    /// <summary>The records the action acted on (their ids); nulls are skipped.</summary>
    public static void RecordIds(IEnumerable<string?> ids)
    {
        var observation = Current;
        if (observation is null) return;
        lock (observation._recordIds)
            foreach (var id in ids)
                if (id is not null && observation._recordIds.Count < MaxRecordIds && !observation._recordIds.Contains(id))
                    observation._recordIds.Add(id);
    }

    public static void RecordId(string? id)
    {
        if (id is not null) RecordIds([id]);
    }

    /// <summary>How the request ended, from the exception the error boundary caught.</summary>
    public static void Failed(Exception cause, bool forbidden, bool forTheUser, string? reference)
    {
        var observation = Current;
        if (observation is null) return;
        observation.Outcome = forbidden ? ActionOutcome.Forbidden
            : forTheUser ? ActionOutcome.UserError : ActionOutcome.Error;
        observation.ErrorType = cause.GetType().FullName;
        if (observation.Outcome == ActionOutcome.Error) observation.ErrorReference = reference;
    }

    public IReadOnlyList<string> RecordIdList()
    {
        lock (_recordIds) return _recordIds.ToList();
    }

    public long DurationMillis => (long)Stopwatch.GetElapsedTime(_started).TotalMilliseconds;

    /// <summary>Ends the request: its activity, its metrics and the audit listeners.</summary>
    public void End(IEnumerable<IActionAuditListener> listeners, string? principal, Identity? identity,
        Action<IActionAuditListener, Exception>? onListenerFailure = null)
    {
        if (_ended) return;
        _ended = true;
        var elapsed = Stopwatch.GetElapsedTime(_started);
        if (Activity is not null)
        {
            if (View is not null) Activity.SetTag("mateu.view", View);
            Activity.SetTag("mateu.outcome", OutcomeValue(Outcome));
            var records = RecordIdList().Count;
            if (records > 0) Activity.SetTag("mateu.record.count", (long)records);
            if (ErrorType is not null) Activity.SetTag("error.type", ErrorType);
            if (ErrorReference is not null) Activity.SetTag("mateu.error.reference", ErrorReference);
            if (Outcome == ActionOutcome.Error) Activity.SetStatus(ActivityStatusCode.Error);
            Activity.Stop();
        }
        var (route, action) = TelemetryNames.MetricKey(Route, ActionId, Outcome);
        if (MateuTelemetry.Duration.Enabled)
            MateuTelemetry.Duration.Record(elapsed.TotalSeconds,
                new KeyValuePair<string, object?>("mateu.route.template", route),
                new KeyValuePair<string, object?>("mateu.action", action),
                new KeyValuePair<string, object?>("mateu.outcome", OutcomeValue(Outcome)));
        if (Outcome == ActionOutcome.Error && MateuTelemetry.Errors.Enabled)
            MateuTelemetry.Errors.Add(1,
                new KeyValuePair<string, object?>("mateu.route.template", route),
                new KeyValuePair<string, object?>("mateu.action", action),
                new KeyValuePair<string, object?>("error.type", ErrorType ?? "_unknown"));
        var all = listeners as IReadOnlyCollection<IActionAuditListener> ?? listeners.ToList();
        if (all.Count == 0) return;
        var auditEvent = new ActionAuditEvent(principal, identity, Route, ActionId, View, RecordIdList(), At,
            (long)elapsed.TotalMilliseconds, Outcome, CorrelationId, ErrorReference);
        foreach (var listener in all)
        {
            try
            {
                listener.OnAction(auditEvent);
            }
            catch (Exception e)
            {
                // an audit trail that fails must not fail the request it reports on: told once per type
                if (FailedListeners.TryAdd(listener.GetType(), 0)) onListenerFailure?.Invoke(listener, e);
            }
        }
    }

    public static string OutcomeValue(ActionOutcome outcome) => outcome switch
    {
        ActionOutcome.Ok => "ok",
        ActionOutcome.UserError => "user_error",
        ActionOutcome.Forbidden => "forbidden",
        ActionOutcome.NotFound => "not_found",
        _ => "error",
    };

    public void Dispose()
    {
        if (!_ended) Activity?.Stop();
        Activity?.Dispose();
        CurrentSlot.Value = _previous;
    }

    /// <summary>A child activity of the request's, for something that already happened (a micro
    /// frontend resolution, reported with its duration once its outcome is known).</summary>
    public static void RecordChild(string name, TimeSpan duration, IEnumerable<KeyValuePair<string, object?>> tags,
        string? error)
    {
        if (!MateuTelemetry.Source.HasListeners()) return;
        var end = DateTimeOffset.UtcNow;
        var parent = Current?.Activity?.Context ?? Activity.Current?.Context ?? default;
        using var activity = MateuTelemetry.Source.StartActivity(name, ActivityKind.Client, parent,
            tags.Where(t => t.Value is not null), startTime: end - duration);
        if (activity is null) return;
        if (error is not null) activity.SetStatus(ActivityStatusCode.Error, error);
        activity.SetEndTime(end.UtcDateTime);
    }
}

/// <summary>The three things <see cref="RequestObservation.Describe(RunActionRqLike)"/> reads.</summary>
internal readonly record struct RunActionRqLike(string? Route, string? ActionId, string? ServerSideType);
