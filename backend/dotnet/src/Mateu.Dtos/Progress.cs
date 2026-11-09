namespace Mateu.Dtos;

// Progress and notifications as patterns (mirrors io.mateu.dtos ProgressDto, MessageActionDto,
// AppNotificationDto, NotificationsChangedDto — see design/progress-and-notifications.md).
// EXPERIMENTAL (3.0).

/// <summary>The states of a task reported by a <c>Progress</c> command (mirrors
/// io.mateu.dtos.ProgressStateDto). EXPERIMENTAL.</summary>
public static class ProgressStates
{
    public const string Running = "running";
    public const string Done = "done";
    public const string Failed = "failed";
    public const string Cancelled = "cancelled";
}

/// <summary>How long a message stays (mirrors io.mateu.dtos.MessagePersistenceDto): <c>toast</c>
/// goes away on its own, <c>sticky</c> stays until dismissed, <c>inbox</c> is a toast that also
/// lands in the notification inbox. EXPERIMENTAL.</summary>
public static class MessagePersistences
{
    public const string Toast = "toast";
    public const string Sticky = "sticky";
    public const string Inbox = "inbox";
}

/// <summary>An action offered by a message, a finished task or an inbox entry: <c>Route</c>
/// navigates, otherwise <c>ActionId</c> (with <c>Parameters</c>) runs. <c>Style</c> is a hint:
/// primary | secondary | danger | undo (an unlabelled undo is labelled by the renderer's "Undo").
/// (Mirrors io.mateu.dtos.MessageActionDto.) EXPERIMENTAL.</summary>
public sealed record MessageActionDto(
    string? Label,
    string? ActionId,
    IReadOnlyDictionary<string, object?>? Parameters,
    string? Route,
    string? Style);

/// <summary>The whole current state of one long-running task — the data of a <c>Progress</c>
/// command; every command is self-contained, renderers upsert by <see cref="TaskId"/>. (Mirrors
/// io.mateu.dtos.ProgressDto.) EXPERIMENTAL.</summary>
public sealed record ProgressDto(
    string TaskId,
    string Title,
    string Text,
    double? Fraction,
    int? Done,
    int? Total,
    string State,
    bool Blocking,
    bool Backgroundable,
    bool Cancellable,
    bool Retryable,
    long? StartedAt,
    int? CloseAfterSeconds,
    string? Error,
    IReadOnlyList<MessageActionDto> ResultActions)
{
    /// <summary>The server's estimate of the seconds left — only for a running, determinate task
    /// once the observed rate makes it honest (conformance/progress/eta.json); null otherwise, and
    /// then absent from the wire. (Mirrors io.mateu.dtos.ProgressDto.etaSeconds.) EXPERIMENTAL.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public int? EtaSeconds { get; init; }
}

/// <summary>One entry of the notification inbox, as listed (<c>_notifications</c>) and pushed
/// (<c>NotificationsChanged</c>). (Mirrors io.mateu.dtos.AppNotificationDto.) EXPERIMENTAL.</summary>
public sealed record AppNotificationDto(
    string Id,
    string? Title,
    string? Text,
    string? Route,
    bool Unread,
    string? When,
    string? Category,
    string? Variant,
    bool Resolved,
    IReadOnlyList<MessageActionDto> Actions,
    bool HasDetail);

/// <summary>The data of a <c>NotificationsChanged</c> command: an entry added or changed, one
/// removed, or — both null — "fetch the list again". (Mirrors io.mateu.dtos.NotificationsChangedDto.)
/// EXPERIMENTAL.</summary>
public sealed record NotificationsChangedDto(AppNotificationDto? Notification, string? RemovedId);
