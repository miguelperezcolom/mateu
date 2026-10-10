using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// App-level actions: notification inbox and global search (Java: NotificationsSupplier / GlobalSearchSupplier runners).
public sealed partial class SyncHandler
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
        if (rq.ActionId == "_notifications-read")
            supplier.MarkNotificationsRead(ReadIds(supplier, rq));
        var data = new Dictionary<string, object?>
        {
            ["_notifications"] = supplier.Notifications() ?? [],
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
