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
internal sealed class RestSourceRegistry : ISpecsCache
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
        DevSpecs.Register(this);
    }

    /// <summary>Dev mode: a spec changed — the catalogue is read again on next use.</summary>
    public void InvalidateSpecs() => _catalog = null;

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
        // sources.yaml AND every other YAML under the specs directory declaring `type: Sources`, like
        // the other authored kinds (Java RestSourceRegistry.authoredFrom); names are global, so the
        // same name in two files is an error naming both
        if (!Directory.Exists(dir)) return RestSourceCatalog.Empty;
        var files = new List<string>();
        var conventional = Path.Combine(dir, FileName);
        if (File.Exists(conventional)) files.Add(conventional);
        foreach (var candidate in Directory.EnumerateFiles(dir, "*.*", SearchOption.AllDirectories)
                     .Where(p => p.EndsWith(".yaml", StringComparison.OrdinalIgnoreCase)
                                 || p.EndsWith(".yml", StringComparison.OrdinalIgnoreCase))
                     .Where(p => Path.GetFullPath(p) != Path.GetFullPath(conventional))
                     .OrderBy(p => p, StringComparer.Ordinal))
        {
            object? head;
            try { head = Yaml.Read<object?>(File.ReadAllText(candidate)); }
            catch { continue; }
            if (head is IDictionary<object, object> m && m.TryGetValue("type", out var t) && "Sources".Equals(t as string))
                files.Add(candidate);
        }
        var entries = new List<RestSourceEntry>();
        var fileOf = new Dictionary<string, string>();
        foreach (var file in files)
        foreach (var entry in ReadFile(dir, file).Sources)
        {
            if (fileOf.TryGetValue(entry.Name, out var previous))
            {
                var message = $"REST source '{entry.Name}' is declared twice: in {Path.GetRelativePath(dir, previous)} and in "
                              + $"{Path.GetRelativePath(dir, file)}. Source names are global — rename one or remove the duplicate.";
                MateuLogging.For("Mateu.RestSources").LogError("{Message}", message);
                throw new InvalidOperationException(message);
            }
            fileOf[entry.Name] = file;
            entries.Add(entry);
        }
        return new RestSourceCatalog(entries);
    }

    private static RestSourceCatalog ReadFile(string dir, string path)
    {
        try
        {
            var root = Yaml.Read<object?>(File.ReadAllText(path));
            var nodes = root switch
            {
                IDictionary<object, object> map when map.TryGetValue("sources", out var s) => s as IEnumerable<object>,
                IEnumerable<object> list => list,
                _ => null,
            };
            // The samples are read a second time TYPED (an unquoted 120.5 a number, not a string),
            // aligned by position with the untyped nodes the rest of the entry is read from.
            var typedRoot = YamlPlain.Parse(File.ReadAllText(path));
            var typedNodes = (typedRoot switch
            {
                IDictionary<string, object?> m when m.TryGetValue("sources", out var ts) => ts as List<object?>,
                List<object?> l => l,
                _ => null,
            }) ?? [];
            var entries = new List<RestSourceEntry>();
            var index = -1;
            foreach (var node in nodes ?? [])
            {
                index++;
                if (node is not IDictionary<object, object> map) continue;
                var typed = index < typedNodes.Count ? typedNodes[index] as IDictionary<string, object?> : null;
                var name = Str(map, "name");
                if (string.IsNullOrWhiteSpace(name))
                {
                    MateuLogging.For("Mateu.RestSources").LogWarning("Ignoring a REST source with no name in {Path}", path);
                    continue;
                }
                var sampleFile = Str(map, "sampleFile") ?? "";
                var source = SourceOf(map.TryGetValue("source", out var s) ? s : null);
                if (typed?.TryGetValue("source", out var typedSource) == true
                    && typedSource is IDictionary<string, object?> ts2 && ts2.TryGetValue("sample", out var inline) && inline is not null)
                    source = source with { Sample = inline };
                entries.Add(new RestSourceEntry(name.Trim(), source)
                {
                    Provenance = ProvenanceOf(Str(map, "provenance"), path),
                    Fields = MapOf(map, "fields"),
                    TotalPath = Str(map, "totalPath") ?? "",
                    Description = Str(map, "description") ?? "",
                    Sample = typed?.TryGetValue("sample", out var sample) == true && sample is not null
                        ? sample
                        : SampleFromFile(dir, name.Trim(), sampleFile),
                    SampleFile = sampleFile,
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

    /// <summary>A <c>sampleFile:</c> (JSON or YAML, relative to the specs directory) as plain data,
    /// or null when none is declared or it cannot be read — a missing sample is WARNed about and the
    /// source simply has none; it never takes the catalogue down.</summary>
    private static object? SampleFromFile(string dir, string sourceName, string sampleFile)
    {
        if (string.IsNullOrWhiteSpace(sampleFile)) return null;
        var relative = sampleFile.TrimStart('/');
        if (relative.StartsWith("specs/ui/", StringComparison.Ordinal)) relative = relative["specs/ui/".Length..];
        var path = Path.Combine(dir, relative);
        try
        {
            if (!File.Exists(path))
            {
                MateuLogging.For("Mateu.RestSources").LogWarning("REST source '{Name}': sampleFile {Path} not found", sourceName, path);
                return null;
            }
            return YamlPlain.Parse(File.ReadAllText(path)); // YAML is a superset of JSON: one reader for both
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.RestSources").LogWarning("REST source '{Name}': could not read sampleFile {Path}: {Error}",
                sourceName, path, e.Message);
            return null;
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
internal sealed class ComponentRegistry : ISpecsCache
{
    public const string FileName = "components.yaml";

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    private readonly Func<ComponentCatalog> _load;
    private ComponentCatalog? _catalog;

    public ComponentRegistry(MateuRegistry registry, string? dir = null)
    {
        var specs = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR") ?? Path.Combine("specs", "ui");
        _load = () => AuthoredFrom(specs, new FieldTypeRegistry(registry, specs)).MergedOver(DerivedFrom(registry.ScannedTypes));
        DevSpecs.Register(this);
    }

    /// <summary>Dev mode: a spec changed — the catalogue is read again on next use.</summary>
    public void InvalidateSpecs() => _catalog = null;

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

    public static ComponentCatalog AuthoredFrom(string dir, FieldTypeRegistry? fieldTypes = null)
    {
        var path = Path.Combine(dir, FileName);
        if (!File.Exists(path)) return ComponentCatalog.Empty;
        try
        {
            var root = Yaml.Read<object?>(File.ReadAllText(path));
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
                var types = fieldTypes ?? new FieldTypeRegistry(dir);
                if (YamlComponentBuilder.FromNode(c, types) is { } component)
                {
                    var entry = new ComponentEntry(name.Trim(), component);
                    // a composition guarded by access keys is rebuilt per caller from its source
                    // (MateuCatalogs.Resolve), and the fields it locks are derived from it
                    if (YamlAccess.DeclaresAccess(c)) AuthoredSources.Remember(entry, c, types);
                    entries.Add(entry);
                }
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
    private static readonly AsyncLocal<FieldTypeCatalog?> Types = new();
    /// <summary>The business components being resolved on the way down this request's mapping.</summary>
    private static readonly AsyncLocal<string[]?> Resolving = new();
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

    internal static void Set(RestSourceCatalog? sources, ComponentCatalog? components, FieldTypeCatalog? fieldTypes = null)
    {
        Rest.Value = sources;
        Comps.Value = components;
        Types.Value = fieldTypes;
    }

    internal static RestSourceCatalog Sources => Rest.Value ?? RestSourceCatalog.Empty;
    internal static ComponentCatalog Components => Comps.Value ?? ComponentCatalog.Empty;
    internal static FieldTypeCatalog FieldTypes => Types.Value ?? FieldTypeCatalog.Empty;

    /// <summary>The composition a <see cref="ComponentRef"/> stands for; an unknown name, or a
    /// reference that closes a cycle (the composition references itself — directly or through
    /// another component), is a visible placeholder, never an error (Java: ComponentToFragmentDtoMapper).</summary>
    internal static IComponent Resolve(ComponentRef reference)
    {
        var chain = Resolving.Value ?? [];
        var entry = !chain.Contains(reference.Ref) && chain.Length < 20 ? Components.Get(reference.Ref) : null;
        return entry is null ? new Text("Unknown business component: " + reference.Ref)
            : AuthoredSources.Of(entry) is { } source ? Personalised(entry, source)
            : entry.Component ?? new Text("Unknown business component: " + reference.Ref);
    }

    /// <summary>An authored composition AS THIS CALLER SEES IT: rebuilt from its source with the
    /// access keys applied (Java's <c>ComponentRegistry.get(name, request)</c>). A failure applying
    /// them yields an EMPTY composition, never the unrestricted one.</summary>
    private static IComponent Personalised(ComponentEntry entry, AuthoredSources.Source source)
    {
        try
        {
            var applied = YamlAccess.Apply(source.Node, ActionGuard.Authorized);
            return applied.Tree is null
                ? new VerticalLayout { Content = [] }
                : YamlComponentBuilder.FromNode(applied.Tree, source.Types) ?? new VerticalLayout { Content = [] };
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.Components").LogError(e, "Could not apply the access keys of business component '{Name}'", entry.Name);
            return new VerticalLayout { Content = [] };
        }
    }

    /// <summary>The ids of the fields the business components <paramref name="names"/> (and the ones
    /// they nest) hide or lock for the caller — dropped from the state the client posts (Java's
    /// <c>ClientLockedFields</c>). Fails CLOSED: a composition whose access keys cannot be evaluated
    /// locks every field it holds; one under a section the caller may not see locks all of its own.</summary>
    internal static IReadOnlySet<string> LockedBy(IEnumerable<string> names)
    {
        var locked = new HashSet<string>();
        foreach (var name in names) Lock(name, [], locked, lockAll: false);
        return locked;
    }

    /// <summary>The names of the authored compositions guarded by access keys.</summary>
    internal static IEnumerable<string> RestrictedNames() =>
        Components.Components.Where(e => AuthoredSources.Of(e) is not null).Select(e => e.Name);

    private static void Lock(string name, string[] chain, HashSet<string> locked, bool lockAll)
    {
        if (chain.Contains(name) || chain.Length >= 20) return;
        if (Components.Get(name) is not { } entry || AuthoredSources.Of(entry) is not { } source) return;
        chain = [.. chain, name];
        var nested = AuthoredSources.RefsIn(source.Node);
        ISet<string> visible = nested;
        if (lockAll)
        {
            locked.UnionWith(AuthoredSources.FieldIdsIn(source.Node));
            visible = new HashSet<string>();
        }
        else
        {
            try
            {
                var applied = YamlAccess.Apply(source.Node, ActionGuard.Authorized);
                locked.UnionWith(applied.LockedFields);
                if (applied.Tree is null)
                {
                    locked.UnionWith(AuthoredSources.FieldIdsIn(source.Node));
                    visible = new HashSet<string>();
                }
                else visible = AuthoredSources.RefsIn(applied.Tree);
            }
            catch (Exception e)
            {
                MateuLogging.For("Mateu.Components").LogError(e, "Could not apply the access keys of business component '{Name}'", name);
                locked.UnionWith(AuthoredSources.FieldIdsIn(source.Node));
                visible = new HashSet<string>();
            }
        }
        foreach (var child in nested) Lock(child, chain, locked, lockAll: !visible.Contains(child));
    }

    /// <summary>Runs <paramref name="body"/> over the resolved composition with the reference on the
    /// chain, so a nested reference to it is seen as the cycle it is.</summary>
    internal static T Within<T>(ComponentRef reference, Func<IComponent, T> body)
    {
        var resolved = Resolve(reference);
        var previous = Resolving.Value;
        Resolving.Value = [.. previous ?? [], reference.Ref];
        try { return body(resolved); }
        finally { Resolving.Value = previous; }
    }

    /// <summary>Maps a resolved reference, guarding against a reference cycle.</summary>
    internal static ClientSideComponentDto MapRef(ComponentRef reference) =>
        Within(reference, ComponentMapper.Map);

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
        Sample = s.Sample,
    };

    /// <summary>The catalogue on the wire (AppDto.restSources). The samples travel ONLY in sample
    /// mode: a production app does not ship design-time data it will never use.</summary>
    internal static List<RestSourceEntryDto> MapCatalogue(RestSourceCatalog catalog, bool withSamples = false) =>
        catalog.Sources.Select(e => new RestSourceEntryDto(
            e.Name, ToDto(withSamples || e.Source is null ? e.Source! : e.Source with { Sample = null }),
            e.Fields.ToDictionary(kv => kv.Key, kv => kv.Value), e.TotalPath,
            e.EffectiveProvenance().ToString().ToLowerInvariant(), e.Description,
            withSamples ? e.Sample : null)).ToList();

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
            // surface's own sample > entry sample > entry.source sample
            Sample = declared.Sample ?? Sources.Get(declared.Ref)!.EffectiveSample(),
        };
    }
}

/// <summary>The authored SOURCE of the business components guarded by access keys, kept beside
/// the entries built from it: what <see cref="MateuCatalogs"/> rebuilds per caller and derives the
/// locked fields from. A side table (not a member of the public <see cref="ComponentEntry"/>).</summary>
internal static class AuthoredSources
{
    internal sealed record Source(object Node, FieldTypeRegistry Types);

    private static readonly System.Runtime.CompilerServices.ConditionalWeakTable<ComponentEntry, Source> Table = new();

    internal static void Remember(ComponentEntry entry, object node, FieldTypeRegistry types) =>
        Table.AddOrUpdate(entry, new Source(YamlAccess.DeepCopy(node)!, types));

    internal static Source? Of(ComponentEntry entry) => Table.TryGetValue(entry, out var s) ? s : null;

    /// <summary>The business components a YAML tree names (<c>type: ComponentRef</c>).</summary>
    internal static HashSet<string> RefsIn(object? node)
    {
        var out_ = new HashSet<string>();
        Walk(node, n =>
        {
            if (Str(n, "type") == "ComponentRef" && Str(n, "ref") is { Length: > 0 } r) out_.Add(r.Trim());
        });
        return out_;
    }

    /// <summary>The ids of every <c>FormField</c> of a YAML tree.</summary>
    internal static HashSet<string> FieldIdsIn(object? node)
    {
        var out_ = new HashSet<string>();
        Walk(node, n =>
        {
            if (Str(n, "type") == "FormField" && Str(n, "id") is { } id) out_.Add(id);
        });
        return out_;
    }

    private static string? Str(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static void Walk(object? node, Action<IDictionary<object, object>> visit)
    {
        switch (node)
        {
            case IDictionary<object, object> map:
                visit(map);
                foreach (var v in map.Values) Walk(v, visit);
                break;
            case string:
                break;
            case IEnumerable<object> list:
                foreach (var v in list) Walk(v, visit);
                break;
        }
    }

    /// <summary>The business components a fluent tree (built in code or from YAML) references.</summary>
    internal static HashSet<string> RefsInTree(object? tree)
    {
        var out_ = new HashSet<string>();
        WalkTree(tree, out_, new HashSet<object>(ReferenceEqualityComparer.Instance), 0);
        return out_;
    }

    private static void WalkTree(object? value, HashSet<string> refs, HashSet<object> seen, int depth)
    {
        if (value is null or string || depth > 64 || value.GetType().IsPrimitive || value is Enum) return;
        if (!seen.Add(value)) return;
        if (value is ComponentRef r)
        {
            if (!string.IsNullOrWhiteSpace(r.Ref)) refs.Add(r.Ref.Trim());
            return;
        }
        if (value is System.Collections.IEnumerable items)
        {
            foreach (var item in items) WalkTree(item, refs, seen, depth + 1);
            return;
        }
        if (value is not IComponent) return;
        foreach (var p in value.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (p.GetIndexParameters().Length > 0) continue;
            var t = p.PropertyType;
            if (t == typeof(string) || t.IsPrimitive || t.IsEnum) continue;
            object? child;
            try { child = p.GetValue(value); }
            catch { continue; }
            WalkTree(child, refs, seen, depth + 1);
        }
    }
}
