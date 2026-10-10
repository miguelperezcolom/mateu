using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// The app's catalogue of named REST sources — every endpoint its screens consume, declared once so
/// no surface repeats a url (the C# mirror of Java's <c>RestSourceRegistry</c>).
///
/// <para>Two producers feed one catalogue. The <b>derived</b> half is <see cref="RestSourceAttribute"/>
/// on the registered view/app classes, then whatever <see cref="IRestSourceCatalogSupplier"/>
/// implementers in the scanned assemblies contribute (last, so configuration can override a
/// compiled-in default of the same name); the <b>authored</b> half is <c>specs/ui/sources.yaml</c>,
/// merged on top. <b>Authored wins</b>, replacing the derived entry outright. Names are GLOBAL, not
/// per mount: a source is an endpoint, not a screen.</para>
///
/// <para>Never fails: a broken file or supplier logs a warning and yields fewer entries.</para>
/// </summary>
public sealed class RestSourceRegistry
{
    public const string FileName = "sources.yaml";

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    private readonly Func<RestSourceCatalog> _load;
    private RestSourceCatalog? _catalog;

    /// <param name="registry">Where the registered classes and the supplier assemblies come from.</param>
    /// <param name="dir">The specs directory (default: MATEU_SPECS_DIR, else specs/ui).</param>
    /// <param name="environment">The deployment environment whose overrides are overlaid on the
    /// merged catalogue (default: MATEU_ENVIRONMENT; none → as authored). See <see cref="Environments"/>.</param>
    public RestSourceRegistry(MateuRegistry registry, string? dir = null, string? environment = null)
    {
        var specs = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR") ?? Path.Combine("specs", "ui");
        _load = () => Environments.OverlayActive(
            AuthoredFrom(specs).MergedOver(DerivedFrom(registry.RegisteredTypes, registry.ScannedTypes)),
            specs, environment);
    }

    /// <summary>A registry over a fixed catalogue (tests, hosts that build it themselves).</summary>
    public RestSourceRegistry(RestSourceCatalog catalog) => _load = () => catalog;

    /// <summary>The merged catalogue (authored over derived), loaded once.</summary>
    public RestSourceCatalog Catalog => _catalog ??= _load();

    /// <summary>The derived half: [RestSource] on the registered classes, then the suppliers.</summary>
    public static RestSourceCatalog DerivedFrom(IEnumerable<Type> registered, IEnumerable<Type> scanned)
    {
        var byName = new Dictionary<string, RestSourceEntry>();
        var order = new List<string>();
        void Put(RestSourceEntry e)
        {
            if (!byName.ContainsKey(e.Name)) order.Add(e.Name);
            byName[e.Name] = e;
        }
        foreach (var type in registered)
        foreach (var declared in type.GetCustomAttributes<RestSourceAttribute>(true))
            if (EntryOf(declared) is { } entry) Put(entry);
        foreach (var type in scanned.Where(t => typeof(IRestSourceCatalogSupplier).IsAssignableFrom(t)
                                                && t is { IsAbstract: false, IsInterface: false }
                                                && t.GetConstructor(Type.EmptyTypes) is not null))
        {
            try
            {
                var contributed = ((IRestSourceCatalogSupplier)Activator.CreateInstance(type)!).RestSources();
                foreach (var e in contributed ?? [])
                    if (e is not null && !string.IsNullOrWhiteSpace(e.Name)) Put(e);
            }
            catch (Exception e)
            {
                MateuLogging.For("Mateu.RestSources").LogWarning(e, "REST source supplier {Type} skipped: {Error}",
                    type.FullName, e.Message);
            }
        }
        return new RestSourceCatalog(order.Select(n => byName[n]).ToList());
    }

    /// <summary>One [RestSource] as a catalogue entry; null when it has no name.</summary>
    public static RestSourceEntry? EntryOf(RestSourceAttribute? declared)
    {
        if (declared is null || string.IsNullOrWhiteSpace(declared.Name)) return null;
        return new RestSourceEntry(declared.Name.Trim(), new RestDataSource
        {
            Url = declared.Url,
            Method = declared.Method,
            Headers = Pairs(declared.Headers, ':'),
            Body = declared.Body,
            ItemsPath = declared.ItemsPath,
            ValuePath = declared.ValuePath,
            LabelPath = declared.LabelPath,
            Proxy = declared.Proxy,
        })
        {
            Provenance = declared.Provenance,
            Fields = Pairs(declared.Fields, '='),
            TotalPath = declared.TotalPath,
            Description = declared.Description,
        };
    }

    /// <summary>The authored half: <c>&lt;dir&gt;/sources.yaml</c> — a <c>sources:</c> envelope or a
    /// bare list; each entry's keys ARE the record's (name, source{…}, provenance, fields, totalPath,
    /// description), the request nested under <c>source:</c> as in Java.</summary>
    public static RestSourceCatalog AuthoredFrom(string dir)
    {
        var path = Path.Combine(dir, FileName);
        if (!File.Exists(path)) return RestSourceCatalog.Empty;
        try
        {
            var root = Yaml.Deserialize<object?>(File.ReadAllText(path));
            var nodes = root switch
            {
                IDictionary<object, object> map when map.TryGetValue("sources", out var s) => s as IEnumerable<object>,
                IEnumerable<object> list => list,
                _ => null,
            };
            var entries = new List<RestSourceEntry>();
            foreach (var node in nodes ?? [])
            {
                if (node is not IDictionary<object, object> map) continue;
                var name = Str(map, "name");
                if (string.IsNullOrWhiteSpace(name))
                {
                    MateuLogging.For("Mateu.RestSources").LogWarning("Ignoring a REST source with no name in {Path}", path);
                    continue;
                }
                entries.Add(new RestSourceEntry(name.Trim(), SourceOf(map.TryGetValue("source", out var s) ? s : null))
                {
                    Provenance = ProvenanceOf(Str(map, "provenance"), path),
                    Fields = MapOf(map, "fields"),
                    TotalPath = Str(map, "totalPath") ?? "",
                    Description = Str(map, "description") ?? "",
                });
            }
            return new RestSourceCatalog(entries);
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.RestSources").LogWarning(e, "{Path} ignored: {Error}", path, e.Message);
            return RestSourceCatalog.Empty;
        }
    }

    internal static RestDataSource SourceOf(object? node)
    {
        if (node is not IDictionary<object, object> map) return new RestDataSource();
        return new RestDataSource
        {
            Ref = Str(map, "ref") ?? "",
            Url = Str(map, "url") ?? "",
            Method = Str(map, "method") ?? "GET",
            Headers = MapOf(map, "headers"),
            Body = Str(map, "body") ?? "",
            ItemsPath = Str(map, "itemsPath") ?? "",
            ValuePath = Str(map, "valuePath") ?? "value",
            LabelPath = Str(map, "labelPath") ?? "label",
            Proxy = bool.TryParse(Str(map, "proxy"), out var proxy) && proxy,
        };
    }

    private static RestSourceProvenance ProvenanceOf(string? declared, string path)
    {
        if (string.IsNullOrWhiteSpace(declared)) return RestSourceProvenance.Auto;
        if (Enum.TryParse<RestSourceProvenance>(declared.Trim(), ignoreCase: true, out var p)) return p;
        MateuLogging.For("Mateu.RestSources").LogWarning(
            "Unknown provenance '{Provenance}' in {Path} — inferring it from the url instead", declared, path);
        return RestSourceProvenance.Auto;
    }

    private static Dictionary<string, string> MapOf(IDictionary<object, object> node, string key)
    {
        var map = new Dictionary<string, string>();
        if (node.TryGetValue(key, out var v) && v is IDictionary<object, object> m)
            foreach (var (k, value) in m)
                map[k.ToString()!] = value?.ToString() ?? "";
        return map;
    }

    private static string? Str(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) ? v?.ToString() : null;

    /// <summary>"Name: Value" / "name=path" declarations into an ordered map.</summary>
    internal static Dictionary<string, string> Pairs(IEnumerable<string>? declarations, char separator)
    {
        var map = new Dictionary<string, string>();
        foreach (var d in declarations ?? [])
        {
            var i = d?.IndexOf(separator) ?? -1;
            if (i > 0) map[d![..i].Trim()] = d[(i + 1)..].Trim();
        }
        return map;
    }
}

/// <summary>
/// The app's catalogue of named business components (the C# mirror of Java's
/// <c>ComponentRegistry</c>): reusable BOUND compositions declared once and referenced by name with a
/// <see cref="ComponentRef"/>. Derived half: <see cref="BusinessComponentAttribute"/> members (static,
/// or instance members of a class with a parameterless constructor) of the scanned assemblies, then
/// <see cref="IComponentCatalogSupplier"/> implementers; authored half: <c>specs/ui/components.yaml</c>
/// (<c>components:</c> envelope or bare list of <c>{name, component}</c>), merged on top — authored
/// wins.
/// </summary>
public sealed class ComponentRegistry
{
    public const string FileName = "components.yaml";

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    private readonly Func<ComponentCatalog> _load;
    private ComponentCatalog? _catalog;

    public ComponentRegistry(MateuRegistry registry, string? dir = null)
    {
        var specs = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR") ?? Path.Combine("specs", "ui");
        _load = () => AuthoredFrom(specs).MergedOver(DerivedFrom(registry.ScannedTypes));
    }

    /// <summary>A registry over a fixed catalogue.</summary>
    public ComponentRegistry(ComponentCatalog catalog) => _load = () => catalog;

    public ComponentCatalog Catalog => _catalog ??= _load();

    public static ComponentCatalog DerivedFrom(IEnumerable<Type> scanned)
    {
        var byName = new Dictionary<string, ComponentEntry>();
        var order = new List<string>();
        void Put(ComponentEntry e)
        {
            if (!byName.ContainsKey(e.Name)) order.Add(e.Name);
            byName[e.Name] = e;
        }
        var log = MateuLogging.For("Mateu.Components");
        foreach (var type in scanned)
        {
            const BindingFlags flags = BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance | BindingFlags.DeclaredOnly;
            var members = type.GetMembers(flags)
                .Where(m => m.GetCustomAttribute<BusinessComponentAttribute>() is not null).ToList();
            if (members.Count > 0)
            {
                object? instance = null;
                foreach (var member in members)
                {
                    var name = member.GetCustomAttribute<BusinessComponentAttribute>()!.Name;
                    try
                    {
                        var isStatic = member switch
                        {
                            PropertyInfo p => p.GetMethod?.IsStatic == true,
                            MethodInfo m => m.IsStatic,
                            FieldInfo f => f.IsStatic,
                            _ => true,
                        };
                        if (!isStatic && instance is null)
                        {
                            if (type.IsAbstract || type.GetConstructor(Type.EmptyTypes) is null) continue;
                            instance = Activator.CreateInstance(type);
                        }
                        var target = isStatic ? null : instance;
                        var value = member switch
                        {
                            PropertyInfo p => p.GetValue(target),
                            MethodInfo m when m.GetParameters().Length == 0 => m.Invoke(target, null),
                            FieldInfo f => f.GetValue(target),
                            _ => null,
                        };
                        if (value is IComponent component && !string.IsNullOrWhiteSpace(name))
                            Put(new ComponentEntry(name.Trim(), component));
                    }
                    catch (Exception e)
                    {
                        log.LogWarning(e, "Business component {Name} on {Type} skipped: {Error}", name, type.FullName, e.Message);
                    }
                }
            }
            if (typeof(IComponentCatalogSupplier).IsAssignableFrom(type)
                && type is { IsAbstract: false, IsInterface: false }
                && type.GetConstructor(Type.EmptyTypes) is not null)
            {
                try
                {
                    foreach (var e in ((IComponentCatalogSupplier)Activator.CreateInstance(type)!).BusinessComponents() ?? [])
                        if (e is not null && !string.IsNullOrWhiteSpace(e.Name)) Put(e);
                }
                catch (Exception e)
                {
                    log.LogWarning(e, "Component catalogue supplier {Type} skipped: {Error}", type.FullName, e.Message);
                }
            }
        }
        return new ComponentCatalog(order.Select(n => byName[n]).ToList());
    }

    public static ComponentCatalog AuthoredFrom(string dir)
    {
        var path = Path.Combine(dir, FileName);
        if (!File.Exists(path)) return ComponentCatalog.Empty;
        try
        {
            var root = Yaml.Deserialize<object?>(File.ReadAllText(path));
            var nodes = root switch
            {
                IDictionary<object, object> map when map.TryGetValue("components", out var s) => s as IEnumerable<object>,
                IEnumerable<object> list => list,
                _ => null,
            };
            var entries = new List<ComponentEntry>();
            foreach (var node in nodes ?? [])
            {
                if (node is not IDictionary<object, object> map) continue;
                var name = map.TryGetValue("name", out var n) ? n?.ToString() : null;
                if (string.IsNullOrWhiteSpace(name) || !map.TryGetValue("component", out var c) || c is null) continue;
                if (YamlComponentBuilder.FromNode(c) is { } component)
                    entries.Add(new ComponentEntry(name.Trim(), component));
                else
                    MateuLogging.For("Mateu.Components").LogWarning("{Path}: could not parse component '{Name}'", path, name);
            }
            return new ComponentCatalog(entries);
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.Components").LogWarning(e, "{Path} ignored: {Error}", path, e.Message);
            return ComponentCatalog.Empty;
        }
    }
}

/// <summary>The catalogues of the request being handled. The mapping code is static and the
/// SyncHandler a singleton, so they ride an AsyncLocal set at the start of each request (the same
/// pattern as the identity in ActionGuard).</summary>
internal static class MateuCatalogs
{
    private static readonly AsyncLocal<RestSourceCatalog?> Rest = new();
    private static readonly AsyncLocal<ComponentCatalog?> Comps = new();
    private static readonly AsyncLocal<int> Depth = new();
    private static readonly AsyncLocal<ActionCatalog?> Acts = new();

    private static readonly AsyncLocal<IReadOnlySet<string>?> RefusedActs = new();

    /// <summary>The action catalogue in effect for this request (set by the SyncHandler).</summary>
    internal static void SetActions(ActionCatalog? actions) => SetActions(actions, null);

    /// <summary>The action catalogue in effect for this request, with the ids of the restricted
    /// entries the caller may NOT run (<c>access:</c>).</summary>
    internal static void SetActions(ActionCatalog? actions, IReadOnlySet<string>? refused)
    {
        Acts.Value = actions;
        RefusedActs.Value = refused;
    }

    /// <summary>The WHOLE catalogue — an id is still the catalogue's even when the caller may not run it.</summary>
    internal static ActionCatalog Actions => Acts.Value ?? ActionCatalog.Empty;

    /// <summary>The ids of the catalogue entries the caller may not run.</summary>
    internal static IReadOnlySet<string> RefusedActions => RefusedActs.Value ?? new HashSet<string>();

    /// <summary>The catalogue as the caller may see it — what is shipped on the wire.</summary>
    internal static ActionCatalog ActionsForCaller => ActionRegistry.Without(Actions, RefusedActions);

    internal static void Set(RestSourceCatalog? sources, ComponentCatalog? components)
    {
        Rest.Value = sources;
        Comps.Value = components;
    }

    internal static RestSourceCatalog Sources => Rest.Value ?? RestSourceCatalog.Empty;
    internal static ComponentCatalog Components => Comps.Value ?? ComponentCatalog.Empty;

    /// <summary>The composition a <see cref="ComponentRef"/> stands for; an unknown name (or a
    /// reference cycle) is a visible placeholder, never an error (Java: ComponentToFragmentDtoMapper).</summary>
    internal static IComponent Resolve(ComponentRef reference) =>
        Depth.Value < 20 && Components.Get(reference.Ref)?.Component is { } component
            ? component
            : new Text("Unknown business component: " + reference.Ref);

    /// <summary>Maps a resolved reference, guarding against a reference cycle.</summary>
    internal static ClientSideComponentDto MapRef(ComponentRef reference)
    {
        Depth.Value++;
        try { return ComponentMapper.Map(Resolve(reference)); }
        finally { Depth.Value--; }
    }

    /// <summary>A uidl descriptor on the wire.</summary>
    internal static RestDataSourceDto ToDto(RestDataSource s) => new(s.Url ?? "")
    {
        Ref = string.IsNullOrWhiteSpace(s.Ref) ? null : s.Ref,
        Method = s.Method,
        Headers = s.Headers?.ToDictionary(kv => kv.Key, kv => kv.Value),
        Body = s.Body,
        ItemsPath = s.ItemsPath,
        ValuePath = s.ValuePath,
        LabelPath = s.LabelPath,
        Proxy = s.Proxy,
    };

    /// <summary>The catalogue on the wire (AppDto.restSources).</summary>
    internal static List<RestSourceEntryDto> MapCatalogue(RestSourceCatalog catalog) =>
        catalog.Sources.Select(e => new RestSourceEntryDto(
            e.Name, ToDto(e.Source), e.Fields.ToDictionary(kv => kv.Key, kv => kv.Value), e.TotalPath,
            e.EffectiveProvenance().ToString().ToLowerInvariant(), e.Description)).ToList();

    /// <summary>The business components on the wire (AppDto.components), compositions mapped.</summary>
    internal static List<ComponentEntryDto> MapComponents(ComponentCatalog catalog) =>
        catalog.Components.Select(e => new ComponentEntryDto(
            e.Name, e.Component is null ? null : ComponentMapper.Map(e.Component))).ToList();

    /// <summary>A descriptor with a catalogue reference filled in (the paths declared on the surface
    /// still win; proxy when either says so). A descriptor that names no source, or names one the
    /// catalogue does not carry, is returned untouched — never a client-supplied url.</summary>
    internal static RestDataSourceDto? Resolved(RestDataSourceDto? declared)
    {
        if (declared is null || string.IsNullOrWhiteSpace(declared.Ref)) return declared;
        if (Sources.Get(declared.Ref) is not { Source: { } from }) return declared;
        static bool Blank(string? s) => string.IsNullOrWhiteSpace(s);
        return declared with
        {
            Url = Blank(declared.Url) ? from.Url ?? "" : declared.Url,
            Method = Blank(declared.Method) ? from.Method : declared.Method,
            Headers = declared.Headers is null || declared.Headers.Count == 0
                ? from.Headers?.ToDictionary(kv => kv.Key, kv => kv.Value)
                : declared.Headers,
            Body = Blank(declared.Body) ? from.Body : declared.Body,
            ItemsPath = Blank(declared.ItemsPath) ? from.ItemsPath : declared.ItemsPath,
            ValuePath = Blank(declared.ValuePath) ? from.ValuePath : declared.ValuePath,
            LabelPath = Blank(declared.LabelPath) ? from.LabelPath : declared.LabelPath,
            Proxy = declared.Proxy || from.Proxy,
        };
    }
}
