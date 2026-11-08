using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

/// <summary>
/// The <c>triggers:</c> a definition declares beside its <c>layout:</c> (Java's
/// <c>YamlUidlLoader.triggersOf</c> read into <c>SeededYamlPage</c> as a <c>TriggersSupplier</c>): a
/// definition-only page has no class to carry a <c>[Trigger]</c>, so its definition does — an
/// on-load, on-custom-event, on-value-change, on-success, on-error or auto-save trigger fires an
/// action without a click. Each entry is discriminated by <c>type</c> (the Java record's simple
/// name: <c>OnLoadTrigger</c>, <c>OnCustomEventTrigger</c>, …) and travels as Java's
/// <c>TriggerMapper.mapTrigger</c> emits it.
/// </summary>
internal static class YamlDeclaredTriggers
{
    /// <summary>The <c>triggers:</c> of a definition's root, in declaration order, as wire triggers.
    /// One that does not parse (no or an unknown <c>type</c>, an unknown <c>source</c>) is dropped
    /// with a warning — the rest still fire (Java's triggersOf).</summary>
    internal static IReadOnlyList<object> Of(object? root)
    {
        if (root is not IDictionary<object, object> map || !map.TryGetValue("triggers", out var nodes)
            || nodes is not IEnumerable<object> list || nodes is string)
            return [];
        var triggers = new List<object>();
        foreach (var node in list)
        {
            if (node is not IDictionary<object, object> trigger) continue;
            if (Read(trigger) is { } dto) triggers.Add(dto);
            else
                MateuLogging.For("Mateu.Yaml").LogWarning(
                    "Ignoring an unparseable trigger in a YAML definition (type '{Type}')", Str(trigger, "type"));
        }
        return triggers;
    }

    private static object? Read(IDictionary<object, object> map)
    {
        var actionId = Str(map, "actionId") ?? "";
        return Str(map, "type") switch
        {
            "OnLoadTrigger" => new OnLoadTriggerDto(actionId, Int(map, "timeoutMillis"), Int(map, "times"),
                Str(map, "condition"), Bool(map, "background")),
            "OnCustomEventTrigger" => SourceOf(Str(map, "source")) is { } source
                ? new CustomTriggerDto(Str(map, "eventName") ?? "", actionId)
                {
                    Source = source, From = Str(map, "from"), Condition = Str(map, "condition"),
                }
                : null,
            "OnValueChangeTrigger" => new OnValueChangeTriggerDto(actionId, Str(map, "propertyName"), Str(map, "condition")),
            "OnSuccessTrigger" => new OnSuccessTriggerDto(actionId, Str(map, "calledActionId"), Str(map, "condition"),
                Int(map, "timeoutMillis"), Bool(map, "background")),
            "OnErrorTrigger" => new OnErrorTriggerDto(actionId, Str(map, "calledActionId"), Str(map, "condition")),
            "AutoSaveTrigger" => ReflectionMapper.AutoSaveTrigger(actionId, Int(map, "debounceMillis")),
            _ => null,
        };
    }

    /// <summary>A custom event's scope: absent = SELF (Java maps a null <c>source</c> to SELF — the
    /// record's own default, unlike <c>[SubscribeTo]</c>'s DOCUMENT); an unknown one does not parse.</summary>
    private static string? SourceOf(string? source) => source switch
    {
        null or "" => "SELF",
        "DOCUMENT" or "COMPONENT" or "SELF" => source,
        _ => null,
    };

    private static string? Str(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static int Int(IDictionary<object, object> map, string key) =>
        int.TryParse(Str(map, key), out var i) ? i : 0;

    private static bool Bool(IDictionary<object, object> map, string key) =>
        bool.TryParse(Str(map, key), out var b) && b;
}
