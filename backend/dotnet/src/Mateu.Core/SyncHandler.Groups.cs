using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Group header actions: a [GroupAction] button on a [GroupBy] group row (Java: @GroupAction, the
// action-on-row-<method> dispatch with _groupValue, GroupActionVisibility).
public sealed partial class SyncHandler
{
    /// <summary>Runs the [GroupAction] method <paramref name="actionId"/> of a listing. Only a
    /// method carrying [GroupAction] is reachable (the id is wire input); a string parameter
    /// receives the clicked group's value (<c>_groupValue</c>). A group the listing vetoes through
    /// <see cref="IGroupActionVisibility"/> is refused — hiding the button is not enough when the
    /// wire can name the action anyway.</summary>
    private static UIIncrementDto GroupActionResult(Type type, object listing, string actionId, RunActionRqDto rq)
    {
        var method = type.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(m => Naming.CamelCase(m.Name) == actionId && m.Find<GroupActionAttribute>() != null);
        if (method is null) return Error($"Action not found: action-on-row-{actionId}");
        var groupValue = StateString(GetState(rq.Parameters, "_groupValue")) ?? "";
        if (listing is IGroupActionVisibility visibility && !visibility.GroupActionVisible(actionId, groupValue))
            throw new MateuForbiddenException($"group action '{actionId}' on {type.FullName} is not available for group '{groupValue}'");
        var args = method.GetParameters()
            .Select(p => p.ParameterType == typeof(string) ? groupValue
                : p.ParameterType == typeof(RunActionRqDto) ? rq
                : (object?)null)
            .ToArray();
        return MapResult(method.Invoke(listing, args), rq);
    }
}
