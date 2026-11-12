using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// W-V-DELETE-FEEDBACK: a deletable listing that declares IRestorable<TId> deletes without asking,
// answers an undoable toast and restores on its Undo (Java: DeleteEditActionHandler +
// RestoreDeletedActionHandler, Python: sync_handler/undo_delete.py).
internal sealed partial class SyncHandler
{
    /// <summary>The closed IRestorable&lt;TId&gt; <paramref name="type"/> implements, or null.</summary>
    internal static Type? RestorableOf(Type type) =>
        type.GetInterfaces().FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRestorable<>));

    /// <summary>"1 record deleted" / "N records deleted" with an Undo running restore-deleted.</summary>
    private static MessageDto UndoableDeleted(IReadOnlyList<string> ids) =>
        MessageOf(Message.Undoable(
            ids.Count == 1 ? "1 record deleted" : $"{ids.Count} records deleted",
            IRestorable<string>.RestoreAction,
            new Dictionary<string, object?> { [IRestorable<string>.RestoreIds] = ids.ToList() }));

    /// <summary>The ids an Undo carries (parameter _restoreIds), as text.</summary>
    private static List<string> RestoreIdsOf(RunActionRqDto rq)
    {
        var raw = rq.Parameters.TryGetValue(IRestorable<string>.RestoreIds, out var v) ? v : null;
        var ids = new List<string>();
        if (raw is JsonElement { ValueKind: JsonValueKind.Array } array)
        {
            foreach (var el in array.EnumerateArray())
                if (StateString(el) is { } id) ids.Add(id);
        }
        else if (raw is System.Collections.IEnumerable list and not string)
        {
            foreach (var item in list)
                if (StateString(item) is { } id) ids.Add(id);
        }
        return ids;
    }

    /// <summary>Restores the ids an Undo carries on <paramref name="target"/> (its IRestorable),
    /// refused (403) when it declares none. Answers the "restored" toast.</summary>
    private static MessageDto Restore(object target, RunActionRqDto rq)
    {
        var restorable = RestorableOf(target.GetType())
            ?? throw ActionGuard.NoSuchAction(IRestorable<string>.RestoreAction);
        var idType = restorable.GetGenericArguments()[0];
        var ids = (System.Collections.IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(idType))!;
        foreach (var raw in RestoreIdsOf(rq)) ids.Add(ToId(raw, idType));
        if (ids.Count > 0)
        {
            restorable.GetMethod("RestoreAllById")!.Invoke(target, [ids]);
            Observability.RequestObservation.RecordIds(ids.Cast<object?>().Select(i => i?.ToString()));
        }
        return MessageOf(new Message(ids.Count == 1 ? "1 record restored" : $"{ids.Count} records restored"));
    }
}
