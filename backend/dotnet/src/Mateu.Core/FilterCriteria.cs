using System.Globalization;
using System.Reflection;
using System.Text.Json;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>The range / multi-select conditions of a crud's smart search bar as typed
/// <see cref="FilterCriterion"/>s, built from the component state — what a database pushdown
/// (<see cref="Crud{T}.Find(string?, IReadOnlyDictionary{string, object?}, IReadOnlyList{FilterCriterion}, Pageable)"/>)
/// turns into WHERE clauses instead of re-parsing the raw keys. The filters of the bar decide which
/// properties take part (the same rules as the metadata, <c>MapCrudFilters</c>): a temporal
/// (DateOnly/DateTime) or a [RangeFilter] numeric reads its <c>&lt;field&gt;_from</c> /
/// <c>&lt;field&gt;_to</c> bounds → <see cref="FilterOperator.Between"/> (both) /
/// <see cref="FilterOperator.Gte"/> / <see cref="FilterOperator.Lte"/>; an enum reads its value list
/// (or comma-joined string, after a URL restore) → <see cref="FilterOperator.In"/>. Values are
/// coerced to the property's type; blank or unparseable bounds and stale enum constants are dropped,
/// never fatal. (Mirrors Java's FilterCriteriaBuilder.)</summary>
internal static class FilterCriteria
{
    public static IReadOnlyList<FilterCriterion> Of(Type element, IReadOnlyDictionary<string, object?> state)
    {
        var criteria = new List<FilterCriterion>();
        foreach (var p in ReflectionMapper.EditableProperties(element))
        {
            var key = Naming.CamelCase(p.Name);
            var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
            if (ReflectionMapper.IsTemporal(t)
                || (ReflectionMapper.IsNumeric(t) && p.Find<RangeFilterAttribute>() is not null))
            {
                var from = Coerce(Text(state, key + "_from"), t);
                var to = Coerce(Text(state, key + "_to"), t);
                if (from is not null && to is not null) criteria.Add(new(key, FilterOperator.Between, [from, to]));
                else if (from is not null) criteria.Add(new(key, FilterOperator.Gte, [from]));
                else if (to is not null) criteria.Add(new(key, FilterOperator.Lte, [to]));
            }
            else if (t.IsEnum && state.TryGetValue(key, out var raw))
            {
                var values = Values(raw)
                    .Select(v => Enum.TryParse(t, v, ignoreCase: false, out var constant) ? constant : null)
                    .Where(v => v is not null).ToList();
                if (values.Count > 0) criteria.Add(new(key, FilterOperator.In, values));
            }
        }
        return criteria;
    }

    private static string? Text(IReadOnlyDictionary<string, object?> state, string key) =>
        state.TryGetValue(key, out var raw) ? raw switch
        {
            null => null,
            JsonElement { ValueKind: JsonValueKind.String } el => el.GetString(),
            JsonElement { ValueKind: JsonValueKind.Null or JsonValueKind.Undefined } => null,
            JsonElement el => el.GetRawText(),
            _ => raw.ToString(),
        } : null;

    private static object? Coerce(string? text, Type t)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        var invariant = CultureInfo.InvariantCulture;
        if (t == typeof(DateOnly))
            return DateOnly.TryParse(text, invariant, out var d) ? d
                : DateTime.TryParse(text, invariant, DateTimeStyles.None, out var dt) ? DateOnly.FromDateTime(dt) : null;
        if (t == typeof(DateTime))
            return DateTime.TryParse(text, invariant, DateTimeStyles.None, out var dt) ? dt : null;
        if (ReflectionMapper.IsNumeric(t)
            && decimal.TryParse(text, NumberStyles.Any, invariant, out var number))
        {
            try { return Convert.ChangeType(number, t, invariant); }
            catch (OverflowException) { return null; }
        }
        return null;
    }

    private static IEnumerable<string> Values(object? raw) => raw switch
    {
        JsonElement { ValueKind: JsonValueKind.Array } el =>
            el.EnumerateArray().Select(e => e.ValueKind == JsonValueKind.String ? e.GetString() ?? "" : e.GetRawText()),
        System.Collections.IEnumerable list and not string => list.Cast<object?>().Select(v => v?.ToString() ?? ""),
        _ => (Text(new Dictionary<string, object?> { ["v"] = raw }, "v") ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
    };
}
