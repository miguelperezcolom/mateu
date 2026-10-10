using System.Reflection;

namespace Mateu.Uidl;

/// <summary>Marks a listing method as an action on a [GroupBy] group: the grid renders a button on
/// every group header row that invokes the method. The clicked group's value travels as the
/// <c>_groupValue</c> action parameter — declare a <c>string groupValue</c> parameter to receive
/// it. Only meaningful on listings whose row class declares a [GroupBy] column. (C# analogue of
/// Java's @GroupAction.)</summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class GroupActionAttribute(string label) : Attribute
{
    /// <summary>The button label.</summary>
    public string Label { get; } = label;
}

/// <summary>Implemented by a listing whose [GroupAction] buttons are not always applicable: the
/// backend asks per group and per action, and the group header row only renders the actions that
/// answer true. <c>actionId</c> is the camelCased method name. (C# analogue of Java's
/// GroupActionVisibility.)</summary>
public interface IGroupActionVisibility
{
    bool GroupActionVisible(string actionId, string groupValue);
}

/// <summary>One group of a [GroupBy] listing: the group value (as text), how many rows it has, the
/// group's value for every [Aggregate] column, and the [GroupAction] ids this group must NOT show
/// (null = all visible). (C# mirror of io.mateu.uidl.data.GroupSummary.)</summary>
public sealed record GroupSummary(
    string Value,
    long Count,
    IReadOnlyDictionary<string, object?>? Aggregates = null,
    IReadOnlyList<string>? HiddenActions = null);

/// <summary>Group helpers shared by the engine and listings that compute their own groups.</summary>
public static class GroupSummaries
{
    /// <summary>The [GroupBy] property of a row class, or null.</summary>
    public static PropertyInfo? GroupByProperty(Type rowType) =>
        rowType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(p => p.GetCustomAttribute<GroupByAttribute>(true) != null);

    /// <summary>Group summaries (counts, first-appearance order) of <paramref name="rows"/> by the
    /// row class's [GroupBy] column — what Java's ListingData.withSynthesizedGroups computes for a
    /// custom listing that did not compute its own. Null when the row class declares no [GroupBy]
    /// or there are no rows.</summary>
    public static IReadOnlyList<GroupSummary>? Synthesize(IEnumerable<object> rows, Type rowType)
    {
        if (GroupByProperty(rowType) is not { } groupBy) return null;
        var counts = new List<(string Value, long Count)>();
        foreach (var row in rows)
        {
            var value = groupBy.GetValue(row)?.ToString() ?? "null";
            var at = counts.FindIndex(c => c.Value == value);
            if (at < 0) counts.Add((value, 1));
            else counts[at] = (value, counts[at].Count + 1);
        }
        return counts.Count == 0
            ? null
            : counts.Select(c => new GroupSummary(c.Value, c.Count, new Dictionary<string, object?>())).ToList();
    }

    /// <summary>The camelCased ids of a listing's [GroupAction] methods.</summary>
    public static IReadOnlyList<string> GroupActionIds(Type listingType) =>
        listingType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .Where(m => m.GetCustomAttribute<GroupActionAttribute>(true) != null)
            .Select(m => char.ToLowerInvariant(m.Name[0]) + m.Name[1..])
            .Distinct()
            .ToList();

    /// <summary>Records, per group, the [GroupAction]s an <see cref="IGroupActionVisibility"/>
    /// listing vetoes (Java's GroupActions.applyVisibility); untouched otherwise.</summary>
    public static IReadOnlyList<GroupSummary>? ApplyVisibility(object? listing, IReadOnlyList<GroupSummary>? groups)
    {
        if (listing is not IGroupActionVisibility visibility || groups is not { Count: > 0 }) return groups;
        var ids = GroupActionIds(listing.GetType());
        if (ids.Count == 0) return groups;
        return groups.Select(group =>
        {
            var hidden = ids.Where(id => !visibility.GroupActionVisible(id, group.Value)).ToList();
            return hidden.Count == 0 ? group : group with { HiddenActions = hidden };
        }).ToList();
    }
}
