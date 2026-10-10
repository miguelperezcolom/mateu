using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Wire state: binding componentState onto a view and coercing values (Java: Hydrater, FieldValueConverter, TypeCoercionHelper).
public sealed partial class SyncHandler
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
        foreach (var p in ReflectionMapper.EditableProperties(instance.GetType()))
        {
            // Mass-assignment guard: a field hidden ([EyesOnly]) or locked ([ReadOnlyUnless]) for
            // this caller is never written from the wire — it keeps its server-side value.
            if (!ActionGuard.MayWrite(p)) continue;
            var key = Naming.CamelCase(p.Name);
            if (!state.TryGetValue(key, out var raw) || raw is null) continue;
            var value = ConvertValue(raw, p.PropertyType);
            if (value is not null) p.SetValue(instance, value);
        }
    }

    private static object? ConvertValue(object raw, Type target)
    {
        target = Nullable.GetUnderlyingType(target) ?? target;
        if (raw is not JsonElement el) return raw;
        try
        {
            if (el.ValueKind is JsonValueKind.Null) return null;
            if (target == typeof(string)) return el.ValueKind == JsonValueKind.String ? el.GetString() : el.ToString();
            if (target == typeof(bool)) return el.GetBoolean();
            if (target == typeof(int)) return el.GetInt32();
            if (target == typeof(long)) return el.GetInt64();
            if (target == typeof(double)) return el.GetDouble();
            if (target == typeof(decimal)) return el.GetDecimal();
            if (target == typeof(DateOnly)) return DateOnly.Parse(el.GetString() ?? "");
            if (target == typeof(DateTime)) return DateTime.Parse(el.GetString() ?? "");
            if (target.IsEnum) return Enum.Parse(target, el.GetString() ?? "", ignoreCase: true);
            // Complex values (grid row lists…) arrive with camelCase keys — bind them as the web wire.
            return el.Deserialize(target, WebJson);
        }
        catch
        {
            return null;
        }
    }
}
