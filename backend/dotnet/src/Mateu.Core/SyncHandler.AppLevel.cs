using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// App-level actions: notification inbox and global search (Java: NotificationsSupplier / GlobalSearchSupplier runners).
internal sealed partial class SyncHandler
{
    /// <summary>The notification inbox's app-level actions (mirrors Java's
    /// NotificationsActionRunner): _notifications-list answers the supplier's current list as a
    /// data-only fragment keyed _notifications; _notifications-read marks the ids parameter (an
    /// explicit list, "all" → every currently-unread id, or one bare id) read and answers the
    /// REFRESHED list the same way.</summary>
    private static UIIncrementDto Notifications(object instance, RunActionRqDto rq)
    {
        if (instance is not INotificationsSupplier supplier)
            return Error("the app class does not implement INotificationsSupplier — no inbox to serve");
        // every id the panel sends back comes from the browser: the supplier is only handed ids of
        // the CALLER's own list (what it answers for this request) and only the actions an entry
        // offers — an app that looks entries up by id alone must not open another user's inbox
        if (rq.ActionId == "_notifications-open")
        {
            // the entry's detail (a drawer, a dialog…) answered like any action's result
            var openId = StateString(GetState(rq.Parameters, "id"));
            if (OwnEntry(supplier, openId) is not { HasDetail: true }) return UIIncrementDto.Of();
            return MapResult(supplier.NotificationDetail(openId!), rq);
        }
        object? result = null;
        if (rq.ActionId == "_notifications-read")
            supplier.MarkNotificationsRead(OwnIds(supplier, ReadIds(supplier, rq)));
        else if (rq.ActionId == "_notifications-dismiss")
            supplier.DismissNotifications(OwnIds(supplier, Ids(rq)));
        else if (rq.ActionId == "_notifications-act")
        {
            var id = StateString(GetState(rq.Parameters, "id"));
            var actionId = StateString(GetState(rq.Parameters, "actionId"));
            if (id is null || actionId is null) throw new UserFacingException("Which notification, and which action?");
            if (OwnEntry(supplier, id) is not { } entry || entry.Actions.All(a => a.ActionId != actionId))
                ActionGuard.Deny("_notifications-act: the caller's inbox has no entry offering that action");
            result = supplier.OnNotificationAction(id, actionId);
        }
        var data = new Dictionary<string, object?>
        {
            ["_notifications"] = (supplier.Notifications() ?? []).Select(NotificationDto).ToList(),
        };
        var list = UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
        return result is null ? list : Merge([MapResult(result, rq), list]);
    }

    /// <summary>The caller's own entry <paramref name="id"/> (in the list the supplier answers now).</summary>
    private static AppNotification? OwnEntry(INotificationsSupplier supplier, string? id) =>
        id is null ? null : (supplier.Notifications() ?? []).FirstOrDefault(n => n is not null && n.Id == id);

    /// <summary><paramref name="ids"/> kept only when they are the caller's own entries.</summary>
    private static List<string> OwnIds(INotificationsSupplier supplier, List<string> ids)
    {
        if (ids.Count == 0) return ids;
        var own = (supplier.Notifications() ?? []).Where(n => n is not null).Select(n => n.Id).ToHashSet();
        return ids.Where(own.Contains).ToList();
    }

    /// <summary>The ids parameter of _notifications-dismiss: a list, or one bare id.</summary>
    private static List<string> Ids(RunActionRqDto rq)
    {
        var raw = GetState(rq.Parameters, "ids");
        if (raw is JsonElement { ValueKind: JsonValueKind.Array }) return MultiValues(raw);
        if (raw is not string && raw is IEnumerable<object?> list) return list.Select(v => v?.ToString() ?? "").ToList();
        return StateString(raw) is { } one ? [one] : [];
    }

    internal const string AppContextSearchPrefix = "_appcontext-search-";

    /// <summary>The [AppContext] header picker's search (mirrors Java's
    /// AppContextSearchActionRunner): the web picker asks _appcontext-search-&lt;field&gt; (with a
    /// searchText parameter) whenever it opens or the user types; answers the selector's options
    /// whose label contains the text, as a data-only page keyed _appcontext_&lt;field&gt;.
    /// Unanswered, every picker the web shell drew for a .NET app greeted the user with an
    /// "action not found" error toast.</summary>
    private UIIncrementDto AppContextSearch(Type appType, RunActionRqDto rq)
    {
        var field = rq.ActionId![AppContextSearchPrefix.Length..];
        var text = (StateString(GetState(rq.Parameters, "searchText")) ?? "").Trim();
        var options = _mapper.MapContextSelectors(appType).FirstOrDefault(s => s.FieldName == field)?.Options ?? [];
        var content = options
            .Where(o => text.Length == 0 || o.Label.Contains(text, StringComparison.OrdinalIgnoreCase))
            .Select(o => new Dictionary<string, object?> { ["value"] = o.Value, ["label"] = o.Label })
            .ToList();
        var data = new Dictionary<string, object?>
        {
            ["_appcontext_" + field] = new Dictionary<string, object?>
            {
                ["content"] = content,
                ["totalElements"] = content.Count,
                ["pageSize"] = content.Count,
                ["pageNumber"] = 0,
            },
        };
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
    }

    /// <summary>The command palette's entity search (mirrors Java's GlobalSearchActionRunner):
    /// _globalsearch with a searchText parameter answers the app class's IGlobalSearchSupplier
    /// hits as a data-only fragment keyed _globalsearch.</summary>
    private static UIIncrementDto GlobalSearch(object instance, RunActionRqDto rq)
    {
        if (instance is not IGlobalSearchSupplier supplier)
            return Error("the app class does not implement IGlobalSearchSupplier — no global search to serve");
        var searchText = StateString(GetState(rq.Parameters, "searchText")) ?? "";
        var data = new Dictionary<string, object?>
        {
            ["_globalsearch"] = supplier.GlobalSearch(searchText) ?? [],
        };
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
    }

    /// <summary>The idle warning's "Stay signed in" (the _keep-alive app-level action): reaching the
    /// server is most of it; an app implementing IKeepAliveHandler is called too. Empty increment.
    /// (Mirrors Java's KeepAliveActionRunner.)</summary>
    private static UIIncrementDto KeepAlive(object instance)
    {
        if (instance is IKeepAliveHandler handler) handler.KeepAlive();
        return UIIncrementDto.Of();
    }

    /// <summary>The first increment of the live-updates stream: the last value published for each
    /// header value, as UpdateHeaderValue commands (empty when nothing was published). (Mirrors the
    /// catch-up of Java's LiveUpdatesActionRunner.)</summary>
    public static UIIncrementDto LiveUpdatesSnapshot() =>
        UIIncrementDto.Of(commands: LiveHeaderValues.Current
            .Select(e => LiveUpdateCommand(e.Key, e.Value)).ToList());

    /// <summary>One header-value change as it travels on the live-updates stream (no target).</summary>
    public static UICommandDto LiveUpdateCommand(string id, string? value) =>
        new(null!, "UpdateHeaderValue", new HeaderValueDto(id, null, value));

    /// <summary>The ids parameter of _notifications-read: an explicit list, "all" → every
    /// currently-unread notification's id, or a single bare id.</summary>
    private static List<string> ReadIds(INotificationsSupplier supplier, RunActionRqDto rq)
    {
        var raw = GetState(rq.Parameters, "ids");
        if (raw is JsonElement { ValueKind: JsonValueKind.Array }) return MultiValues(raw);
        var text = StateString(raw);
        if (text == "all")
            return (supplier.Notifications() ?? []).Where(n => n.Unread).Select(n => n.Id).ToList();
        return text is null ? [] : [text];
    }
}
