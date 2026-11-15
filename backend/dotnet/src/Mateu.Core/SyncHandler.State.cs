using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Wire state: binding componentState onto a view and coercing values (Java: Hydrater, FieldValueConverter, TypeCoercionHelper).
internal sealed partial class SyncHandler
{
    private static object? GetState(Dictionary<string, object?>? state, string key)
        => state is not null && state.TryGetValue(key, out var v) ? v : null;

    /// <summary>The id inside the calendar's <c>_clickedEvent</c> action parameter — a map
    /// {id, title, date, color} the frontend sends with every "openCalendarEvent" dispatch
    /// (mirrors Java reading httpRequest.runActionRq().parameters().get("_clickedEvent") as a Map).</summary>
    private static string? ClickedEventId(RunActionRqDto rq) => GetState(rq.Parameters, "_clickedEvent") switch
    {
        JsonElement { ValueKind: JsonValueKind.Object } el =>
            el.TryGetProperty("id", out var id) ? StateString(id) : null,
        IDictionary<string, object?> map => StateString(map.TryGetValue("id", out var id) ? id : null),
        _ => null,
    };

    private static int ToInt(object? v, int fallback)
    {
        if (v is null) return fallback;
        if (v is System.Text.Json.JsonElement je)
            return je.ValueKind == System.Text.Json.JsonValueKind.Number && je.TryGetInt32(out var n) ? n : fallback;
        return int.TryParse(v.ToString(), out var m) ? m : fallback;
    }

    private static string? StateString(object? raw) => raw switch
    {
        null => null,
        JsonElement { ValueKind: JsonValueKind.String } el => el.GetString(),
        JsonElement { ValueKind: JsonValueKind.Number } el => el.GetRawText(),
        JsonElement { ValueKind: JsonValueKind.True } => "true",
        JsonElement { ValueKind: JsonValueKind.False } => "false",
        JsonElement { ValueKind: JsonValueKind.Null or JsonValueKind.Undefined } => null,
        _ => raw.ToString(),
    };

    private static string? SearchText(RunActionRqDto rq) =>
        rq.ComponentState.TryGetValue("searchText", out var v) && v is JsonElement { ValueKind: JsonValueKind.String } el
            ? el.GetString()
            : null;

    private static object? CellValue(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        Enum e => e.ToString(),
        _ => value,
    };

    private static void BindState(object instance, IDictionary<string, object?> state)
    {
        // A view drawing its own tree may reference business components (components.yaml): the
        // fields they hide or lock for the caller are not writable either. STRICT: every restricted
        // composition of the app counts, whatever the view drew before (it may draw one only in some
        // state) — the same rule a YAML layout follows in GuardYamlAccess.
        if (instance is IComponentTreeSupplier)
            state = MateuCatalogs.WithoutLocked(instance.GetType().FullName ?? instance.GetType().Name, state, MateuCatalogs.AppWideLockedBy());
        foreach (var p in ReflectionMapper.EditableProperties(instance.GetType()))
        {
            // Mass-assignment guard: a field hidden ([EyesOnly]) or locked ([ReadOnlyUnless]) for
            // this caller is never written from the wire — it keeps its server-side value.
            if (!ActionGuard.MayWrite(p)) continue;
            var key = Naming.CamelCase(p.Name);
            // A nested data object: rebuilt from its nested map overlaid with the flattened
            // <field>-<key> entries (the flattened ones win), recursively, on the instance the
            // property already holds (Java's Hydrater over FormViewSerializer's state).
            if (ReflectionMapper.IsNestedFormPropertyType(p))
            {
                BindNested(instance, p, key, state);
                continue;
            }
            if (!state.TryGetValue(key, out var raw) || raw is null) continue;
            if (ReflectionMapper.GridRowType(p) is { } rowType && Protects(rowType)
                && raw is JsonElement { ValueKind: JsonValueKind.Array } rows
                && BindRows(instance, p, rowType, rows) is { } bound)
            {
                p.SetValue(instance, bound);
                continue;
            }
            if (IsCleared(raw, p.PropertyType))
            {
                // A cleared input clears the property (Java's FieldValueConverter): keeping the
                // initializer made the screen (empty) and the server disagree. A non-nullable
                // value type cannot hold an absence, so it gets its default.
                p.SetValue(instance, p.PropertyType.IsValueType && Nullable.GetUnderlyingType(p.PropertyType) is null
                    ? Activator.CreateInstance(p.PropertyType)
                    : null);
                continue;
            }
            var value = ConvertValue(raw, p.PropertyType);
            if (value is not null) p.SetValue(instance, value);
        }
    }

    /// <summary>Whether some property of <paramref name="rowType"/> — or of an object it holds — is
    /// one this caller may not write (or read).</summary>
    private static bool Protects(Type rowType, int depth = 0)
    {
        if (depth > 8) return false;
        foreach (var p in ReflectionMapper.EditableProperties(rowType))
        {
            if (!ActionGuard.MayWrite(p)) return true;
            if (ReflectionMapper.IsNestedFormPropertyType(p) && Protects(p.PropertyType, depth + 1)) return true;
            if (ReflectionMapper.GridRowType(p) is { } inner && inner != rowType && Protects(inner, depth + 1)) return true;
        }
        return false;
    }

    /// <summary>A grid field's incoming rows bound one by one, each laid over the row the instance
    /// ALREADY holds — the same id when the row type has one, else the one at that position — so a
    /// cell the caller may not write keeps its value instead of taking the client's (or falling to
    /// the row type's default). A row the user added starts fresh. Deserialised whole, the list
    /// wrote every cell, [ReadOnlyUnless] and [EyesOnly] ones included (GA review 2, D3; Python's
    /// <c>_held_rows</c>, Java's FieldAccess walk over lists).</summary>
    private static object? BindRows(object instance, PropertyInfo p, Type rowType, JsonElement rows)
    {
        var current = (p.GetValue(instance) as System.Collections.IEnumerable)?.Cast<object>().ToList() ?? [];
        var idProperty = EntityIds.PropertyOf(rowType);
        var byId = new Dictionary<string, object>();
        if (idProperty is not null)
            foreach (var row in current)
                if (idProperty.GetValue(row)?.ToString() is { Length: > 0 } id) byId.TryAdd(id, row);
        var bound = (System.Collections.IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(rowType))!;
        var i = 0;
        foreach (var raw in rows.EnumerateArray())
        {
            var position = i++;
            if (AsStateMap(raw) is not { } map) continue;
            object? held = null;
            if (idProperty is not null)
            {
                var wanted = map.TryGetValue(Naming.CamelCase(idProperty.Name), out var v) && v is JsonElement el
                    ? (el.ValueKind == JsonValueKind.String ? el.GetString() : el.ToString())
                    : null;
                if (wanted is { Length: > 0 }) byId.TryGetValue(wanted, out held);
            }
            else if (position < current.Count) held = current[position];
            var row = held is not null && rowType.IsInstanceOfType(held) ? Copy(held) : Activator.CreateInstance(rowType);
            if (row is null) continue;
            BindState(row, map);
            bound.Add(row);
        }
        var target = p.PropertyType;
        if (target.IsArray)
        {
            var array = Array.CreateInstance(rowType, bound.Count);
            bound.CopyTo(array, 0);
            return array;
        }
        if (target.IsAssignableFrom(bound.GetType())) return bound;
        // a collection type a List cannot stand for: nothing written, the server's rows stay
        MateuLogging.For("Mateu.State").LogWarning(
            "Grid rows of {Property} not bound: {Type} has protected cells and is no List or array", p.Name, target.Name);
        return p.GetValue(instance);
    }

    private static readonly MethodInfo MemberwiseCloneMethod =
        typeof(object).GetMethod("MemberwiseClone", BindingFlags.Instance | BindingFlags.NonPublic)!;

    /// <summary>A shallow copy the binding writes into, never the object itself (it may be shared).</summary>
    private static object Copy(object value) => MemberwiseCloneMethod.Invoke(value, null)!;

    private static void BindNested(object instance, PropertyInfo p, string key, IDictionary<string, object?> state)
    {
        var prefix = key + "-";
        var flattened = state.Where(kv => kv.Key.StartsWith(prefix, StringComparison.Ordinal) && kv.Key.Length > prefix.Length)
            .ToDictionary(kv => kv.Key[prefix.Length..], kv => kv.Value);
        var nested = state.TryGetValue(key, out var raw) ? AsStateMap(raw) : null;
        if (nested is null && flattened.Count == 0) return;
        // bound into a copy the instance then owns: the object it holds may be shared (a static
        // default, the stored row a grid row was laid over) — binding into it wrote one caller's
        // values for every other (GA review 2, D8 / Python Y6). Each level copies its own.
        var target = p.GetValue(instance) is { } held ? Copy(held) : Activator.CreateInstance(p.PropertyType)!;
        if (nested is not null) BindState(target, nested);
        if (flattened.Count > 0) BindState(target, flattened);
        p.SetValue(instance, target);
    }

    /// <summary>A wire value that is a JSON object (or an already-built map) as a state map; else null.</summary>
    private static Dictionary<string, object?>? AsStateMap(object? raw) => raw switch
    {
        JsonElement { ValueKind: JsonValueKind.Object } el =>
            el.EnumerateObject().ToDictionary(x => x.Name, x => (object?)x.Value),
        IDictionary<string, object?> map => new Dictionary<string, object?>(map),
        _ => null,
    };

    /// <summary>A null, or a blank string aimed at a non-text property: the user cleared it.</summary>
    private static bool IsCleared(object raw, Type target) =>
        raw is JsonElement { ValueKind: JsonValueKind.Null }
        || (raw is JsonElement { ValueKind: JsonValueKind.String } el && target != typeof(string)
            && string.IsNullOrWhiteSpace(el.GetString()));

    internal static object? ConvertValue(object raw, Type target)
    {
        target = Nullable.GetUnderlyingType(target) ?? target;
        if (raw is not JsonElement el) return raw;
        // A cleared non-text field (null / "") is not a conversion failure: nothing to bind.
        if (target != typeof(string)
            && (el.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined
                || (el.ValueKind == JsonValueKind.String && string.IsNullOrEmpty(el.GetString()))))
            return null;
        try
        {
            if (el.ValueKind is JsonValueKind.Null) return null;
            if (target == typeof(string)) return el.ValueKind == JsonValueKind.String ? el.GetString() : el.ToString();
            // The web number field's value is a STRING ("77"): a text-typed number is still a
            // number (Java's FieldValueConverter parses it). Read with GetDouble, it threw and the
            // edited value silently never saved.
            if (el.ValueKind == JsonValueKind.String && (target == typeof(bool) || target == typeof(int)
                    || target == typeof(long) || target == typeof(double) || target == typeof(decimal)
                    || target == typeof(float)))
                return System.Convert.ChangeType(el.GetString()!.Trim(), target,
                    System.Globalization.CultureInfo.InvariantCulture);
            if (target == typeof(bool)) return el.GetBoolean();
            if (target == typeof(int)) return el.GetInt32();
            if (target == typeof(long)) return el.GetInt64();
            if (target == typeof(double)) return el.GetDouble();
            if (target == typeof(decimal)) return el.GetDecimal();
            if (target == typeof(DateOnly)) return DateOnly.Parse(el.GetString() ?? "");
            if (target == typeof(DateTime) || target == typeof(DateTimeOffset) || target == typeof(TimeOnly)
                || target == typeof(System.Numerics.BigInteger))
                return TemporalWire.Parse(el.ValueKind == JsonValueKind.String ? el.GetString()! : el.GetRawText(), target);
            if (target.IsEnum) return Enum.Parse(target, el.GetString() ?? "", ignoreCase: true);
            // Complex values (grid row lists…) arrive with camelCase keys — bind them as the web wire.
            return el.Deserialize(target, WebJson);
        }
        catch (Exception e)
        {
            // An unconvertible wire value leaves the property at its server-side value; logged so a
            // field that "never saves" can be traced to the value the client actually sent.
            MateuLogging.For("Mateu.State").LogWarning("Wire value {Value} could not be converted to {Type}: {Error}",
                raw, target.Name, e.Message);
            return null;
        }
    }
}
