using System.Collections.Concurrent;
using System.Reflection;
using System.Text.RegularExpressions;
using Mateu.Uidl;

namespace Mateu.Core.MicroFrontends;

/// <summary>The application's content slots: every [ContentSlot] property of the scanned assemblies,
/// their keys checked when the views are registered — a key is a contract with the content service,
/// so a malformed or repeated one fails at startup (the port has no annotation processor: Java fails
/// the compilation instead) — and the descriptor the content service reads through the reserved
/// action <c>__content_slots__</c> (Java: ContentSlotIndex + ContentSlotDescriptors).</summary>
internal static class ContentSlotDescriptors
{
    public const string Action = "__content_slots__";
    public const string AppDataKey = "_contentSlots";

    /// <summary><c>application.screen.name</c> (more segments allowed: the last is the name, the ones
    /// between the first and the last the screen): lower case letters and digits, dash-separated words.</summary>
    // a plain Regex, not [GeneratedRegex]: the generator emits code no test walks through
    private static readonly Regex KeyRegex = new("^[a-z0-9]+(?:-[a-z0-9]+)*(?:\\.[a-z0-9]+(?:-[a-z0-9]+)*){2,}$", RegexOptions.Compiled);

    internal static Regex KeyPattern() => KeyRegex;

    internal sealed record Slot(
        string Key, string DeclaredIn, string Field, string? Route, string Fallback, string Description,
        int TimeoutMs, bool DegradeToClient);

    private static readonly ConcurrentDictionary<Assembly, IReadOnlyList<Slot>> ByAssembly = new();

    /// <summary>The slots of <paramref name="assemblies"/>, checked: throws when a key is malformed
    /// or names two slots.</summary>
    public static IReadOnlyList<Slot> Of(IEnumerable<Assembly> assemblies) =>
        Checked(assemblies.Distinct().SelectMany(a => ByAssembly.GetOrAdd(a, Declared)));

    /// <summary>The slots declared by <paramref name="types"/>, checked.</summary>
    public static IReadOnlyList<Slot> OfTypes(IEnumerable<Type> types) => Checked(types.SelectMany(DeclaredBy));

    private static IReadOnlyList<Slot> Checked(IEnumerable<Slot> slots)
    {
        var byKey = new Dictionary<string, Slot>(StringComparer.Ordinal);
        foreach (var slot in slots)
        {
            if (!KeyPattern().IsMatch(slot.Key))
                throw new InvalidOperationException(
                    $"[ContentSlot] key '{slot.Key}' on {slot.DeclaredIn}.{slot.Field} is not application.screen.name"
                    + " (lower case letters, digits and dashes, dot-separated, at least three segments)");
            if (byKey.TryGetValue(slot.Key, out var previous))
                throw new InvalidOperationException(
                    $"[ContentSlot] key '{slot.Key}' on {slot.DeclaredIn}.{slot.Field} is already used by"
                    + $" {previous.DeclaredIn}.{previous.Field}: a key names one slot of the application");
            byKey[slot.Key] = slot;
        }
        return byKey.Values.ToList();
    }

    private static IReadOnlyList<Slot> Declared(Assembly assembly)
    {
        Type[] types;
        try { types = assembly.GetTypes(); }
        catch (ReflectionTypeLoadException e) { types = e.Types.OfType<Type>().ToArray(); }
        return types.SelectMany(DeclaredBy).ToList();
    }

    private static IEnumerable<Slot> DeclaredBy(Type type)
    {
        if (type.IsSubclassOf(typeof(Attribute))) yield break;
        var route = type.GetCustomAttribute<UIAttribute>()?.Route;
        foreach (var p in type.GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance
                                             | BindingFlags.DeclaredOnly))
        {
            if (p.Find<ContentSlotAttribute>() is not { } slot) continue;
            yield return new Slot(slot.Key ?? "", type.FullName ?? type.Name, p.Name, route, slot.Fallback ?? "",
                slot.Description ?? "", slot.TimeoutMs, slot.DegradeToClient);
        }
    }

    /// <summary>The descriptor (Java's content-slots.json shape).</summary>
    public static Dictionary<string, object?> Descriptor(IReadOnlyList<Slot> slots) => new()
    {
        ["version"] = 1,
        ["slots"] = slots.Select(slot =>
        {
            var segments = slot.Key.Split('.');
            var entry = new Dictionary<string, object?>
            {
                ["key"] = slot.Key,
                ["application"] = segments[0],
                ["screen"] = string.Join(".", segments[1..^1]),
                ["name"] = segments[^1],
                ["declaredIn"] = slot.DeclaredIn,
                ["field"] = slot.Field,
            };
            if (slot.Route is not null) entry["route"] = slot.Route;
            entry["fallback"] = slot.Fallback;
            entry["description"] = slot.Description;
            entry["timeoutMs"] = slot.TimeoutMs;
            entry["degradeToClient"] = slot.DegradeToClient;
            return entry;
        }).ToList(),
        // duplicates fail at registration, so a served descriptor never has any
        ["duplicates"] = new List<string>(),
    };
}
