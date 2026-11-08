namespace Mateu.Uidl;

public enum MessageVariant { Success, Info, Warning, Error, Contrast }

/// <summary>A user-facing toast/alert an action can return. A message can carry an UNDO action
/// (<see cref="Undoable"/>): the toast renders an Undo button that dispatches
/// <see cref="UndoActionId"/> (with <see cref="UndoParameters"/>) on the initiator component —
/// the standard recoverability affordance after destructive or bulk actions. The undo method is
/// a plain action of the same class (it must reverse the effect itself, e.g. restore a
/// soft-deleted row). (C# analogue of io.mateu.uidl.data.Message.)</summary>
public sealed class Message(string text, MessageVariant variant = MessageVariant.Success, string title = "")
{
    public string Text { get; } = text;
    public MessageVariant Variant { get; } = variant;
    public string Title { get; } = title;
    public int Duration { get; init; } = 5000;
    public string? UndoLabel { get; init; }
    public string? UndoActionId { get; init; }
    public IReadOnlyDictionary<string, object?>? UndoParameters { get; init; }

    /// <summary>How long the message stays: toast, sticky or inbox (null: an error is sticky,
    /// anything else a toast). (Mirrors io.mateu.uidl.data.Message.persistence.) EXPERIMENTAL.</summary>
    public MessagePersistence? Persistence { get; init; }

    /// <summary>What the user can do from the message (Undo is one of them, style "undo").
    /// (Mirrors io.mateu.uidl.data.Message.actions.) EXPERIMENTAL.</summary>
    public IReadOnlyList<MessageAction> Actions { get; init; } = [];

    /// <summary>Deduplication key: a message with the same key replaces the one on screen.
    /// (Mirrors io.mateu.uidl.data.Message.key.) EXPERIMENTAL.</summary>
    public string? Key { get; init; }

    /// <summary>The style hint of an undo action. EXPERIMENTAL.</summary>
    public const string StyleUndo = "undo";

    /// <summary>A toast with an Undo button dispatching the given action (10 s so there is time
    /// to react). The undo travels both as the legacy Undo* members and as one of the actions.</summary>
    public static Message Undoable(
        string text, string undoActionId, IReadOnlyDictionary<string, object?>? undoParameters = null) =>
        new(text, MessageVariant.Contrast)
        {
            Duration = 10000,
            UndoActionId = undoActionId,
            UndoParameters = undoParameters,
            Actions = [new MessageAction(null, undoActionId, undoParameters, null, StyleUndo)],
        };

    /// <summary>The same message offering one more action. EXPERIMENTAL.</summary>
    public Message WithAction(MessageAction action) => Copy(actions: [.. Actions, action]);

    /// <summary>The same message with another persistence. EXPERIMENTAL.</summary>
    public Message WithPersistence(MessagePersistence persistence) => Copy(persistence: persistence);

    /// <summary>The same message with a deduplication key. EXPERIMENTAL.</summary>
    public Message WithKey(string key) => Copy(key: key);

    private Message Copy(IReadOnlyList<MessageAction>? actions = null, MessagePersistence? persistence = null,
        string? key = null) =>
        new(Text, Variant, Title)
        {
            Duration = Duration,
            UndoLabel = UndoLabel,
            UndoActionId = UndoActionId,
            UndoParameters = UndoParameters,
            Persistence = persistence ?? Persistence,
            Actions = actions ?? Actions,
            Key = key ?? Key,
        };
}

/// <summary>How long a <see cref="Message"/> stays (mirrors io.mateu.uidl.data.MessagePersistence):
/// Toast goes away on its own, Sticky stays until dismissed, Inbox is a toast that also lands in
/// the notification inbox. EXPERIMENTAL.</summary>
public enum MessagePersistence { Toast, Sticky, Inbox }

/// <summary>An action offered by a <see cref="Message"/>, a finished <see cref="LongTask"/> or an
/// inbox <see cref="AppNotification"/>: <c>Route</c> navigates, otherwise <c>ActionId</c> (with
/// <c>Parameters</c>) runs. <c>Style</c> is a hint: primary | secondary | danger | undo. (Mirrors
/// io.mateu.uidl.data.MessageAction.) EXPERIMENTAL.</summary>
public sealed record MessageAction(
    string? Label,
    string? ActionId = null,
    IReadOnlyDictionary<string, object?>? Parameters = null,
    string? Route = null,
    string? Style = null)
{
    /// <summary>An action that runs <paramref name="actionId"/>.</summary>
    public static MessageAction Run(string label, string actionId,
        IReadOnlyDictionary<string, object?>? parameters = null) => new(label, actionId, parameters);

    /// <summary>An action that navigates to <paramref name="route"/>.</summary>
    public static MessageAction Open(string label, string route) => new(label, Route: route);

    /// <summary>The same action with a style hint.</summary>
    public MessageAction WithStyle(string style) => this with { Style = style };
}

/// <summary>Navigation link rendered as an icon at the right side of a form field (see [LinkTo]
/// and <see cref="ILinkSupplier"/>). Href/Title may carry <c>${...}</c> expressions, interpolated
/// client-side against the live component state. (C# analogue of io.mateu.uidl.data.NavLink.)</summary>
public sealed record NavLink(string Href, string? Icon = null, string? Title = null, string? Target = null);

/// <summary>Implemented by a view to attach a navigation link icon to fields at runtime (an
/// alternative to the static [LinkTo] attribute, over which this takes precedence). Return the
/// <see cref="NavLink"/> for the property named by the memberName argument, or null for no link
/// — a [LinkTo] on the property then applies if present. (C# analogue of Java's LinkSupplier.)</summary>
public interface ILinkSupplier
{
    NavLink? Link(string memberName);
}

/// <summary>A selectable option; Children makes it a node of a hierarchical option set
/// ([TreeSelect] fields). (C# analogue of Java's Option.)</summary>
public sealed record Option(string Value, string Label, IReadOnlyList<Option>? Children = null);

/// <summary>Supplies the fixed set of selectable options for a field (C# analogue of Java's
/// OptionsSupplier). Options may carry Children → hierarchical sets for [TreeSelect].</summary>
public interface IOptionsSupplier
{
    IReadOnlyList<Option> Options(string fieldName);
}

/// <summary>An action button rendered on the app header, next to the [AppContext] selectors.
/// ActionId names the public method of the app class to invoke; Icon is an optional icon name.
/// An action with Children renders as a dropdown menu instead of a button: only the children
/// dispatch. (C# analogue of io.mateu.uidl.data.AppHeaderAction.)</summary>
public sealed record AppHeaderAction(
    string? ActionId, string Label, string? Icon = null, IReadOnlyList<AppHeaderAction>? Children = null)
{
    /// <summary>A dropdown of actions under one header button.</summary>
    public static AppHeaderAction Menu(string label, string? icon, IReadOnlyList<AppHeaderAction> children) =>
        new(null, label, icon, children);
}

/// <summary>Implemented by the [App] class to name the route the app opens on (its home page) — one
/// of its menu routes, mount-relative, e.g. "home". Without it a [MenuItem] app declares no home and
/// its root shows an empty content area until a menu entry is picked. An IAppSupplier shell's own
/// HomeRoute wins over it. (C# analogue of Java's HomeRouteSupplier.)</summary>
public interface IHomeRouteSupplier
{
    string HomeRoute();
}

/// <summary>Implemented by an app shell to contribute action buttons to the app header, next to
/// the [AppContext] selectors. Evaluated on every shell build, so actions can appear and
/// disappear with server-side state. (C# analogue of Java's AppActionsSupplier.)</summary>
public interface IAppActionsSupplier
{
    IReadOnlyList<AppHeaderAction> AppActions();
}

/// <summary>One entry of the app's notification inbox (the header bell): a short title, an
/// optional longer text, an optional route to navigate to when clicked, whether it is still
/// unread, and a display timestamp (already formatted — the server owns the locale/relative
/// formatting). (C# analogue of io.mateu.uidl.data.AppNotification.)</summary>
public sealed record AppNotification(
    string Id, string Title, string? Text, string? Route, bool Unread = true, string? When = null)
{
    /// <summary>Groups the entry in the inbox (by source or type). EXPERIMENTAL.</summary>
    public string? Category { get; init; }

    /// <summary>The entry's severity. EXPERIMENTAL.</summary>
    public MessageVariant? Variant { get; init; }

    /// <summary>Acted upon (approved, done…): kept in the list, shown under "resolved". EXPERIMENTAL.</summary>
    public bool Resolved { get; init; }

    /// <summary>What the user can do from the entry — run by
    /// <see cref="INotificationsSupplier.OnNotificationAction"/>. EXPERIMENTAL.</summary>
    public IReadOnlyList<MessageAction> Actions { get; init; } = [];

    /// <summary>Clicking it asks the server for its detail
    /// (<see cref="INotificationsSupplier.NotificationDetail"/>) instead of navigating. EXPERIMENTAL.</summary>
    public bool HasDetail { get; init; }
}

/// <summary>Implemented by the app class to give the shell a NOTIFICATION INBOX: a bell on the
/// header with the unread count, opening a panel that lists <see cref="AppNotification"/>s. The
/// list is fetched per request (the <c>_notifications-list</c> app-level action); clicking an
/// entry navigates to its route and marks it read, the panel's "mark all read" calls
/// <see cref="MarkNotificationsRead"/> with all the unread ids (the <c>_notifications-read</c>
/// action). (C# analogue of Java's NotificationsSupplier.)</summary>
public interface INotificationsSupplier
{
    IReadOnlyList<AppNotification> Notifications();

    void MarkNotificationsRead(IReadOnlyList<string> ids);

    /// <summary>Runs one of an entry's actions (the <c>_notifications-act</c> app-level action) —
    /// approve, reject, assign… and usually mark it Resolved. What it returns is answered like any
    /// action's result; the refreshed list follows. Not implemented: refused. The id comes from the
    /// browser: check it belongs to the caller. EXPERIMENTAL.</summary>
    object? OnNotificationAction(string id, string actionId) =>
        throw new UserFacingException("This notification has no actions");

    /// <summary>Removes entries from the caller's inbox (the per-item dismiss). EXPERIMENTAL.</summary>
    void DismissNotifications(IReadOnlyList<string> ids) { }

    /// <summary>The detail of an entry with HasDetail (the <c>_notifications-open</c> app-level
    /// action): typically a Drawer or a Dialog. Null: nothing opens. EXPERIMENTAL.</summary>
    object? NotificationDetail(string id) => null;
}

/// <summary>Where the INBOX messages of the answers are kept, per authenticated principal — an
/// interface the app may implement (Mateu ships UI only): register an IInboxStore service and it
/// replaces Mateu's default, in memory, per process, bounded (100 entries per principal, 10 000
/// principals) and lost on restart. A <see cref="MessagePersistence.Inbox"/> message of an
/// authenticated caller is <see cref="Add"/>ed (and pushed to the principal's other sessions);
/// the bell lists it next to the <see cref="INotificationsSupplier"/>'s entries. (C# analogue of
/// Java's io.mateu.uidl.interfaces.InboxStore.) EXPERIMENTAL.</summary>
public interface IInboxStore
{
    /// <summary>Adds the entry to the principal's inbox — replacing an entry with the same id.</summary>
    void Add(string principal, AppNotification entry);

    /// <summary>The principal's entries, newest first.</summary>
    IReadOnlyList<AppNotification> List(string principal);

    /// <summary>Marks the principal's entries read (ids not in the inbox are ignored).</summary>
    void MarkRead(string principal, IReadOnlyList<string> ids);

    /// <summary>Removes the principal's entries (ids not in the inbox are ignored).</summary>
    void Dismiss(string principal, IReadOnlyList<string> ids);
}

/// <summary>One hit of the app-wide entity search (the command palette's data results): a label,
/// an optional secondary line, the route to navigate to, and an optional category caption used to
/// group the palette's results ("Clientes", "Reservas"…). (C# analogue of
/// io.mateu.uidl.data.GlobalSearchResult.)</summary>
public sealed record GlobalSearchResult(string Label, string? Description, string Route, string? Category)
{
    public GlobalSearchResult(string label, string route) : this(label, null, route, null) { }
}

/// <summary>Implemented by the [App] class to make the command palette (⌘K) search DATA, not just
/// the menu: while the user types, the palette also asks the server for matching entities through
/// the app-level <c>_globalsearch</c> action and shows the hits (grouped by category) alongside
/// the navigation results; picking one navigates to its route. Keep it fast — search indexes or
/// top-N per category. (C# analogue of Java's GlobalSearchSupplier.)</summary>
public interface IGlobalSearchSupplier
{
    IReadOnlyList<GlobalSearchResult> GlobalSearch(string searchText);
}

/// <summary>Resolves the display label of a reference field's PRE-EXISTING value: when a form
/// loads with a [Lookup]/[Searchable] field already set, the framework asks the view (or the
/// [Searchable] selector) for the label so the raw id is never shown. (C# analogue of Java's
/// LookupLabelSupplier.)</summary>
public interface ILookupLabelSupplier
{
    string? Label(string fieldName, object id);
}
