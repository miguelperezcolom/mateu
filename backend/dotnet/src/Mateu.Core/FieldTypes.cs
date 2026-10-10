using System.Collections.Concurrent;
using System.Globalization;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// The app's FIELD TYPE catalogue — its domain vocabulary (<c>OrderStatus</c>, <c>Money</c>,
/// <c>Email</c>): what a concept looks like as a field or a column, declared once (the C# mirror of
/// Java's <c>FieldTypeRegistry</c>).
///
/// <para>Two producers, one table, exactly like <see cref="RestSourceRegistry"/>:
/// <see cref="IFieldTypeCatalogSupplier"/> implementers in the scanned assemblies (code, the
/// <b>derived</b> half) and <c>specs/ui/types.yaml</c> (the <b>authored</b> half), merged by id with
/// <b>authored winning</b>. Ids are global, not per mount: a type is vocabulary, not a screen.</para>
///
/// <para>Never fails: a broken file or entry logs and yields fewer types. A field naming a type the
/// catalogue does not carry is WARNed about (once per id) and rendered as declared.</para>
/// </summary>
public sealed class FieldTypeRegistry
{
    public const string FileName = "types.yaml";

    /// <summary>A registry with no types: references are warned about and rendered as declared.</summary>
    public static FieldTypeRegistry None { get; } = new(FieldTypeCatalog.Empty);

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    private readonly Func<FieldTypeCatalog> _load;
    private FieldTypeCatalog? _catalog;

    /// <summary>The ids already warned about as unknown — so a page rendered on every request does
    /// not flood the log.</summary>
    internal ConcurrentDictionary<string, bool> Warned { get; } = new();

    /// <param name="registry">Where the supplier assemblies come from.</param>
    /// <param name="dir">The specs directory (default: MATEU_SPECS_DIR, else specs/ui).</param>
    public FieldTypeRegistry(MateuRegistry registry, string? dir = null)
    {
        var specs = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR") ?? Path.Combine("specs", "ui");
        _load = () => AuthoredFrom(specs).MergedOver(DerivedFrom(registry.ScannedTypes));
    }

    /// <summary>A registry over the authored file alone (no code suppliers).</summary>
    public FieldTypeRegistry(string dir) => _load = () => AuthoredFrom(dir);

    /// <summary>A registry over a fixed catalogue (tests, hosts that build it themselves).</summary>
    public FieldTypeRegistry(FieldTypeCatalog catalog) => _load = () => catalog;

    /// <summary>The merged catalogue (authored over code), loaded once.</summary>
    public FieldTypeCatalog Catalog => _catalog ??= _load();

    /// <summary><paramref name="node"/> (a parsed YAML object) with its <c>fieldType</c> reference
    /// resolved against this catalogue — a NEW map when it carries one, the same map otherwise.</summary>
    public IDictionary<object, object> Resolve(IDictionary<object, object> node) =>
        FieldTypeResolver.Apply(node, Catalog, Warned);

    /// <summary>The derived half: what the <see cref="IFieldTypeCatalogSupplier"/> implementers of
    /// the scanned assemblies contribute (a later one wins for the same id).</summary>
    public static FieldTypeCatalog DerivedFrom(IEnumerable<Type> scanned)
    {
        var byId = new Dictionary<string, FieldTypeEntry>();
        var order = new List<string>();
        foreach (var type in scanned.Where(t => typeof(IFieldTypeCatalogSupplier).IsAssignableFrom(t)
                                                && t is { IsAbstract: false, IsInterface: false }
                                                && t.GetConstructor(Type.EmptyTypes) is not null))
        {
            try
            {
                foreach (var e in ((IFieldTypeCatalogSupplier)Activator.CreateInstance(type)!).FieldTypes() ?? [])
                {
                    if (e is null || string.IsNullOrWhiteSpace(e.Id)) continue;
                    var entry = e with { Id = e.Id.Trim() };
                    if (!byId.ContainsKey(entry.Id)) order.Add(entry.Id);
                    byId[entry.Id] = entry;
                }
            }
            catch (Exception e)
            {
                MateuLogging.For("Mateu.FieldTypes").LogWarning(e, "Field type supplier {Type} skipped: {Error}",
                    type.FullName, e.Message);
            }
        }
        return new FieldTypeCatalog(order.Select(id => byId[id]).ToList());
    }

    /// <summary>The authored half: <c>&lt;dir&gt;/types.yaml</c> — a <c>types:</c> envelope
    /// (optionally typed <c>type: Types</c>) or a bare list. The keys ARE
    /// <see cref="FieldTypeEntry"/>'s properties, camel-cased.</summary>
    public static FieldTypeCatalog AuthoredFrom(string dir)
    {
        var path = Path.Combine(dir, FileName);
        if (!File.Exists(path)) return FieldTypeCatalog.Empty;
        try
        {
            var root = Yaml.Deserialize<object?>(File.ReadAllText(path));
            var nodes = root switch
            {
                IDictionary<object, object> map when map.TryGetValue("types", out var t) => t as IEnumerable<object>,
                IEnumerable<object> list => list,
                _ => null,
            };
            var entries = new List<FieldTypeEntry>();
            foreach (var node in nodes ?? [])
            {
                if (node is not IDictionary<object, object> map) continue;
                if (EntryOf(map) is { } entry) entries.Add(entry);
                else MateuLogging.For("Mateu.FieldTypes").LogWarning("Ignoring a field type with no id in {Path}", path);
            }
            return new FieldTypeCatalog(entries);
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.FieldTypes").LogWarning(e, "{Path} ignored: {Error}", path, e.Message);
            return FieldTypeCatalog.Empty;
        }
    }

    private static FieldTypeEntry? EntryOf(IDictionary<object, object> map)
    {
        var id = Str(map, "id");
        if (string.IsNullOrWhiteSpace(id)) return null;
        return new FieldTypeEntry(id.Trim())
        {
            Label = Str(map, "label"),
            DataType = Str(map, "dataType"),
            Stereotype = Str(map, "stereotype"),
            Placeholder = Str(map, "placeholder"),
            Description = Str(map, "description"),
            Required = BoolOf(map, "required"),
            ReadOnly = BoolOf(map, "readOnly"),
            Options = map.TryGetValue("options", out var o) && o is IEnumerable<object> options
                ? options.OfType<IDictionary<object, object>>().Select(OptionOf).ToList()
                : null,
            OptionsSource = map.TryGetValue("optionsSource", out var os) && os is IDictionary<object, object> src
                ? new RestDataSource
                {
                    Ref = Str(src, "ref") ?? "",
                    Url = Str(src, "url"),
                    Method = Str(src, "method"),
                    ItemsPath = Str(src, "itemsPath"),
                    ValuePath = Str(src, "valuePath"),
                    LabelPath = Str(src, "labelPath"),
                    Proxy = BoolOf(src, "proxy") ?? false,
                }
                : null,
            Min = DoubleOf(map, "min"),
            Max = DoubleOf(map, "max"),
            Step = DoubleOf(map, "step"),
            Colspan = int.TryParse(Str(map, "colspan"), NumberStyles.Integer, CultureInfo.InvariantCulture, out var c) ? c : null,
            Style = Str(map, "style"),
            CssClasses = Str(map, "cssClasses"),
            Align = Str(map, "align"),
            Width = Str(map, "width"),
            AutoWidth = BoolOf(map, "autoWidth"),
            Tones = map.TryGetValue("tones", out var t) && t is IDictionary<object, object> tones
                ? tones.ToDictionary(kv => kv.Key.ToString()!, kv => kv.Value?.ToString() ?? "")
                : null,
        };
    }

    private static Option OptionOf(IDictionary<object, object> map)
    {
        var value = Str(map, "value") ?? "";
        return new Option(value, Str(map, "label") ?? value);
    }

    private static string? Str(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static bool? BoolOf(IDictionary<object, object> map, string key) =>
        bool.TryParse(Str(map, key), out var b) ? b : null;

    private static double? DoubleOf(IDictionary<object, object> map, string key) =>
        double.TryParse(Str(map, key), NumberStyles.Float, CultureInfo.InvariantCulture, out var d) ? d : null;
}

/// <summary>
/// Resolves a <c>fieldType: &lt;id&gt;</c> reference on an AUTHORED YAML object, before it is built
/// into a component — the rule identical in Java's <c>FieldTypeResolver</c>, the browser expander
/// (<c>fieldTypes.ts</c>) and the Python loader, because a definition must render the same wherever
/// it is expanded:
/// <list type="number">
/// <item>any object carrying a string <c>fieldType</c> is a reference;</item>
/// <item>every attribute the type declares is copied onto it UNLESS the object already declares that
/// attribute with a non-null value — a GridColumn only takes the column attributes, a FormField only
/// the field ones, anything else all of them;</item>
/// <item>the <c>fieldType</c> key is removed, so the wire never carries it;</item>
/// <item>an unknown type is WARNed about and the object rendered as declared — never a failed page.</item>
/// </list>
/// </summary>
public static class FieldTypeResolver
{
    /// <summary>The authored key a field or a column references a type by.</summary>
    public const string Key = "fieldType";

    private static readonly string[] All =
    [
        "label", "dataType", "stereotype", "placeholder", "description", "required", "readOnly",
        "options", "optionsSource", "min", "max", "step", "colspan", "style", "cssClasses",
        "align", "width", "autoWidth", "tones",
    ];

    private static readonly Dictionary<string, string[]> OnlyFor = new()
    {
        ["GridColumn"] = ["label", "dataType", "stereotype", "style", "cssClasses", "align", "width", "autoWidth", "tones"],
        ["FormField"] =
        [
            "label", "dataType", "stereotype", "placeholder", "description", "required", "readOnly",
            "options", "optionsSource", "min", "max", "step", "colspan", "style", "cssClasses",
        ],
    };

    /// <summary><paramref name="node"/> with its reference resolved (a copy), or the node itself when
    /// it names no type. <paramref name="warned"/> collects the unknown ids already logged.</summary>
    public static IDictionary<object, object> Apply(
        IDictionary<object, object> node, FieldTypeCatalog catalog, ConcurrentDictionary<string, bool>? warned = null)
    {
        if (!node.TryGetValue(Key, out var reference) || reference is not string typeId) return node;
        var resolved = new Dictionary<object, object>(node);
        resolved.Remove(Key);
        var type = catalog.Get(typeId);
        if (type is null)
        {
            if ((warned ?? new()).TryAdd(typeId, true))
                MateuLogging.For("Mateu.FieldTypes").LogWarning(
                    "Unknown field type '{Type}' (on '{Id}') — rendered as declared. Declare it in specs/ui/types.yaml or an IFieldTypeCatalogSupplier.",
                    typeId, node.TryGetValue("id", out var id) ? id : "");
            return resolved;
        }
        var allowed = node.TryGetValue("type", out var t) && t is string kind && OnlyFor.TryGetValue(kind, out var only)
            ? only
            : All;
        var attributes = AttributesOf(type);
        foreach (var attribute in allowed)
        {
            if (!attributes.TryGetValue(attribute, out var value)) continue;
            if (!resolved.TryGetValue(attribute, out var own) || own is null) resolved[attribute] = value;
        }
        return resolved;
    }

    /// <summary>The attributes a type supplies, as authored YAML node values (scalars as strings,
    /// maps and lists as YAML-shaped collections); absent and empty ones omitted.</summary>
    public static Dictionary<string, object> AttributesOf(FieldTypeEntry type)
    {
        var a = new Dictionary<string, object>();
        void Put(string key, object? value)
        {
            switch (value)
            {
                case null:
                case string s when s.Length == 0:
                    return;
                case bool b: a[key] = b ? "true" : "false"; return;
                case double d: a[key] = d.ToString(CultureInfo.InvariantCulture); return;
                case int i: a[key] = i.ToString(CultureInfo.InvariantCulture); return;
                default: a[key] = value; return;
            }
        }
        Put("label", type.Label);
        Put("dataType", type.DataType);
        Put("stereotype", type.Stereotype);
        Put("placeholder", type.Placeholder);
        Put("description", type.Description);
        Put("required", type.Required);
        Put("readOnly", type.ReadOnly);
        if (type.Options is { Count: > 0 } options)
            Put("options", options.Select(o => (object)new Dictionary<object, object> { ["value"] = o.Value, ["label"] = o.Label }).ToList());
        if (type.OptionsSource is { } src)
        {
            var s = new Dictionary<object, object>();
            if (src.HasRef()) s["ref"] = src.Ref;
            if (!string.IsNullOrEmpty(src.Url)) s["url"] = src.Url;
            if (!string.IsNullOrEmpty(src.Method)) s["method"] = src.Method;
            if (!string.IsNullOrEmpty(src.ItemsPath)) s["itemsPath"] = src.ItemsPath;
            if (!string.IsNullOrEmpty(src.ValuePath)) s["valuePath"] = src.ValuePath;
            if (!string.IsNullOrEmpty(src.LabelPath)) s["labelPath"] = src.LabelPath;
            if (src.Proxy) s["proxy"] = "true";
            if (s.Count > 0) Put("optionsSource", s);
        }
        Put("min", type.Min);
        Put("max", type.Max);
        Put("step", type.Step);
        Put("colspan", type.Colspan);
        Put("style", type.Style);
        Put("cssClasses", type.CssClasses);
        Put("align", type.Align);
        Put("width", type.Width);
        Put("autoWidth", type.AutoWidth);
        if (type.Tones is { Count: > 0 } tones)
            Put("tones", tones.ToDictionary(kv => (object)kv.Key, kv => (object)kv.Value));
        return a;
    }
}

/// <summary>
/// Whether REST sources answer with their SAMPLE data instead of calling the endpoint (the C# mirror
/// of Java's <c>SampleSources</c>). The rule, the same on every leg and in every renderer: sample data
/// is used always in the visual editor, in a bundle built with the mock flag, and at runtime ONLY
/// when the app opts in — here the environment variable <c>MATEU_SOURCES_MOCK=true</c> (or
/// <c>1</c>), or the handler's <c>MockSources</c> option (<c>MateuOptions.MockSources</c> in
/// ASP.NET). Never silently in production.
/// </summary>
public static class SampleSources
{
    public const string Env = "MATEU_SOURCES_MOCK";

    /// <summary>True when the environment opts the running app into sample data.</summary>
    public static bool EnabledByEnvironment() => Truthy(Environment.GetEnvironmentVariable(Env));

    /// <summary>Whether an opt-in value says yes: <c>true</c> (any case) or <c>1</c>.</summary>
    public static bool Truthy(string? value) =>
        value is not null && (value.Trim().Equals("true", StringComparison.OrdinalIgnoreCase) || value.Trim() == "1");

    /// <summary>Whether a request's HTTP method only reads (the sample answers it).</summary>
    internal static bool IsRead(string? method)
    {
        var m = string.IsNullOrWhiteSpace(method) ? "GET" : method.Trim().ToUpperInvariant();
        return m is "GET" or "HEAD";
    }
}

/// <summary>YAML (or JSON — YAML is a superset) read as PLAIN typed data: string-keyed dictionaries,
/// lists and scalars with an unquoted number/boolean/null read as one — what the wire carries (the
/// untyped YamlDotNet reader leaves every scalar a string).</summary>
internal static class YamlPlain
{
    private static readonly IDeserializer Typed =
        new DeserializerBuilder().WithAttemptingUnquotedStringTypeDeserialization().Build();

    internal static object? Parse(string text) => Plain(Typed.Deserialize<object?>(text));

    internal static object? Plain(object? node) => node switch
    {
        IDictionary<object, object> map => map.ToDictionary(kv => kv.Key.ToString()!, kv => Plain(kv.Value)),
        string s => s,
        IEnumerable<object> list => list.Select(Plain).ToList(),
        _ => node,
    };
}
