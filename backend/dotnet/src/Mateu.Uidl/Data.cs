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

    /// <summary>A toast with an Undo button dispatching the given action (10 s so there is time
    /// to react).</summary>
    public static Message Undoable(
        string text, string undoActionId, IReadOnlyDictionary<string, object?>? undoParameters = null) =>
        new(text, MessageVariant.Contrast)
        {
            Duration = 10000,
            UndoLabel = "Deshacer",
            UndoActionId = undoActionId,
            UndoParameters = undoParameters,
        };
}

/// <summary>Navigation link rendered as an icon at the right side of a form field (see [LinkTo]
/// and <see cref="ILinkSupplier"/>). Href/Title may carry <c>${...}</c> expressions, interpolated
/// client-side against the live component state. (C# analogue of io.mateu.uidl.data.NavLink.)</summary>
public sealed record NavLink(string Href, string? Icon = null, string? Title = null, string? Target = null);

/// <summary>Implemented by a view to attach a navigation link icon to fields at runtime (an
/// alternative to the static [LinkTo] attribute, over which this takes precedence). Return the
/// <see cref="NavLink"/> for the property named <paramref name="memberName"/>, or null for no link
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
    string Id, string Title, string? Text, string? Route, bool Unread = true, string? When = null);

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
