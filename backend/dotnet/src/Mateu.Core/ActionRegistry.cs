using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// The app's catalogue of named, client-runnable ACTIONS — flows (<c>steps</c>) and REST calls
/// (<c>restAction</c>) declared once and run by id from the shell menu or any page (the C# mirror of
/// Java's <c>ActionRegistry</c>).
///
/// <para>Two producers, one table: the DERIVED half is whatever <see cref="IActionCatalogSupplier"/>
/// implementers in the scanned assemblies contribute; the AUTHORED half is <c>specs/ui/actions.yaml</c>
/// plus any other file under the specs directory declaring <c>type: Actions</c>, merged on top —
/// <b>authored wins</b>, replacing outright. Ids are GLOBAL.</para>
///
/// <para>Only client-runnable entries are kept: one with neither steps nor a restAction is dropped with
/// a warning — server logic stays a view method. Never fails: a broken file logs and yields fewer
/// entries.</para>
/// </summary>
public sealed class ActionRegistry
{
    public const string FileName = "actions.yaml";
    public const string Type = "Actions";

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    private readonly Func<ActionCatalog> _load;
    private ActionCatalog? _catalog;

    public ActionRegistry(MateuRegistry registry, string? dir = null)
    {
        var specs = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR") ?? Path.Combine("specs", "ui");
        _load = () => AuthoredFrom(specs).MergedOver(DerivedFrom(registry.ScannedTypes));
    }

    /// <summary>A registry over a fixed catalogue (tests, hosts that build it themselves).</summary>
    public ActionRegistry(ActionCatalog catalog) => _load = () => catalog;

    /// <summary>The merged catalogue (authored over derived), loaded once.</summary>
    public ActionCatalog Catalog => _catalog ??= _load();

    /// <summary>The ids of every catalogue entry that declares <c>access:</c>.</summary>
    public IReadOnlySet<string> RestrictedIds() => RestrictedIn(Catalog);

    /// <summary>Whether any catalogue entry declares <c>access:</c>.</summary>
    public bool RestrictsAny() => Catalog.Actions.Any(a => a.Access is { } x && x.Restricts());

    /// <summary>Whether the caller may run catalogue action <paramref name="id"/> (true for an
    /// unknown or unrestricted id).</summary>
    public bool Grants(string id, Func<Access?, bool> granted) =>
        Catalog.Get(id)?.Access is not { } access || granted(access);

    /// <summary>The ids of the restricted catalogue actions the caller may NOT run.</summary>
    public IReadOnlySet<string> RefusedFor(Func<Access?, bool> granted) => RefusedIn(Catalog, granted);

    /// <summary>The catalogue without the entries the caller may not run.</summary>
    public ActionCatalog CatalogFor(Func<Access?, bool> granted) => Without(Catalog, RefusedFor(granted));

    internal static IReadOnlySet<string> RestrictedIn(ActionCatalog catalog) =>
        catalog.Actions.Where(a => a.Access is { } x && x.Restricts()).Select(a => a.Id).ToHashSet();

    internal static IReadOnlySet<string> RefusedIn(ActionCatalog catalog, Func<Access?, bool> granted) =>
        catalog.Actions.Where(a => a.Access is { } x && x.Restricts() && !granted(x)).Select(a => a.Id).ToHashSet();

    internal static ActionCatalog Without(ActionCatalog catalog, IReadOnlySet<string> refused) =>
        refused.Count == 0 ? catalog : new ActionCatalog(catalog.Actions.Where(a => !refused.Contains(a.Id)).ToList());

    /// <summary>Every <c>actionId</c> / <c>*ActionId</c> a deserialised YAML tree names (mirrors
    /// Java's ActionRegistry.collectIds).</summary>
    internal static void CollectIds(object? node, ISet<string> into)
    {
        switch (node)
        {
            case IDictionary<object, object> map:
                foreach (var (k, v) in map)
                {
                    var name = k?.ToString() ?? "";
                    if (v is string s && (name == "actionId" || name.EndsWith("ActionId")) && !string.IsNullOrWhiteSpace(s))
                        into.Add(s);
                    else CollectIds(v, into);
                }
                break;
            case string:
                break;
            case IEnumerable<object> list:
                foreach (var v in list) CollectIds(v, into);
                break;
        }
    }

    /// <summary>The action ids <paramref name="tree"/> names that its own <c>actions:</c> do not
    /// declare — OWNER FIRST: an id the page declares is the page's, never the catalogue's.</summary>
    internal static HashSet<string> CatalogueIdsNamedBy(object? tree)
    {
        var ids = new HashSet<string>();
        CollectIds(tree, ids);
        if (tree is IDictionary<object, object> map && map.TryGetValue("actions", out var own) && own is IEnumerable<object> list)
            foreach (var action in list)
                if (action is IDictionary<object, object> a && a.TryGetValue("id", out var id) && id is not null)
                    ids.Remove(id.ToString()!);
        return ids;
    }

    private static ILogger Log => MateuLogging.For("Mateu.Actions");

    /// <summary>The derived half: what the <see cref="IActionCatalogSupplier"/> implementers add.</summary>
    public static ActionCatalog DerivedFrom(IEnumerable<System.Type> scanned)
    {
        var entries = new List<CatalogAction>();
        foreach (var type in scanned.Where(t => typeof(IActionCatalogSupplier).IsAssignableFrom(t)
                                                && t is { IsAbstract: false, IsInterface: false }
                                                && t.GetConstructor(System.Type.EmptyTypes) is not null))
        {
            try
            {
                var contributed = ((IActionCatalogSupplier)Activator.CreateInstance(type)!).ActionCatalog();
                entries.AddRange((contributed ?? []).Where(a => a is not null && !string.IsNullOrWhiteSpace(a.Id)));
            }
            catch (Exception e)
            {
                Log.LogWarning(e, "Action catalogue supplier {Type} skipped: {Error}", type.FullName, e.Message);
            }
        }
        // MergedOver(null) dedups by id, a later contribution replacing an earlier one
        return new ActionCatalog(ClientRunnableOnly(entries, "a supplier")).MergedOver(null);
    }

    /// <summary>The authored half: <c>&lt;dir&gt;/actions.yaml</c> (with or without a <c>type:</c>
    /// header) then every other YAML under <paramref name="dir"/> declaring <c>type: Actions</c>, in
    /// path order — a later file's entry replaces an earlier one of the same id. Each file is an
    /// <c>actions:</c> envelope or a bare list of entries shaped like a page definition's actions.</summary>
    public static ActionCatalog AuthoredFrom(string dir)
    {
        if (!Directory.Exists(dir)) return ActionCatalog.Empty;
        var files = new List<string>();
        var conventional = Path.Combine(dir, FileName);
        if (File.Exists(conventional)) files.Add(conventional);
        foreach (var path in Directory.EnumerateFiles(dir, "*.*", SearchOption.AllDirectories)
                     .Where(p => p.EndsWith(".yaml", StringComparison.OrdinalIgnoreCase)
                                 || p.EndsWith(".yml", StringComparison.OrdinalIgnoreCase))
                     .Where(p => Path.GetFullPath(p) != Path.GetFullPath(conventional))
                     .OrderBy(p => p, StringComparer.Ordinal))
        {
            if (Root(path) is IDictionary<object, object> map && Str(map, "type") == Type) files.Add(path);
        }
        var byId = new Dictionary<string, CatalogAction>();
        var order = new List<string>();
        foreach (var file in files)
        foreach (var action in Read(file))
        {
            if (!byId.ContainsKey(action.Id)) order.Add(action.Id);
            byId[action.Id] = action;
        }
        return new ActionCatalog(order.Select(i => byId[i]).ToList());
    }

    private static object? Root(string path)
    {
        try { return Yaml.Deserialize<object?>(File.ReadAllText(path)); }
        catch { return null; }
    }

    private static List<CatalogAction> Read(string path)
    {
        try
        {
            var nodes = Root(path) switch
            {
                IDictionary<object, object> map when map.TryGetValue("actions", out var a) => a as IEnumerable<object>,
                IEnumerable<object> list => list,
                _ => null,
            };
            var parsed = new List<CatalogAction>();
            foreach (var node in nodes ?? [])
            {
                if (node is not IDictionary<object, object> map) continue;
                var id = Str(map, "id");
                if (string.IsNullOrWhiteSpace(id))
                {
                    Log.LogWarning("Ignoring an action with no id in {Path}", path);
                    continue;
                }
                parsed.Add(new CatalogAction(id.Trim())
                {
                    Description = Str(map, "description") ?? "",
                    Steps = StepsOf(map.TryGetValue("steps", out var s) ? s : null),
                    RestAction = RestActionOf(map.TryGetValue("restAction", out var r) ? r : null),
                    // remembered by id: enforced like a page's own declared action (YamlAccess)
                    Access = YamlAccess.AccessOf(map.TryGetValue("access", out var acc) ? acc : null),
                });
            }
            return ClientRunnableOnly(parsed, path);
        }
        catch (Exception e)
        {
            Log.LogWarning(e, "Action catalogue {Path} ignored: {Error}", path, e.Message);
            return [];
        }
    }

    /// <summary>Drops (with a warning naming it) every entry that would need a server to run.</summary>
    internal static List<CatalogAction> ClientRunnableOnly(IEnumerable<CatalogAction> actions, string origin)
    {
        var accepted = new List<CatalogAction>();
        foreach (var action in actions)
        {
            if (action.ClientRunnable()) accepted.Add(action);
            else
                Log.LogWarning(
                    "Action catalogue: '{Id}' in {Origin} is not client-runnable (it has neither steps nor a"
                    + " restAction) and is ignored — server logic stays a view method", action.Id, origin);
        }
        return accepted;
    }

    private static IReadOnlyList<FlowStep> StepsOf(object? node)
    {
        var steps = new List<FlowStep>();
        foreach (var item in node as IEnumerable<object> ?? [])
        {
            if (item is not IDictionary<object, object> map) continue;
            FlowStep? step = Str(map, "type") switch
            {
                "Navigate" => new Navigate(Str(map, "route") ?? ""),
                "Emit" => new Emit(Str(map, "event") ?? "", map.TryGetValue("payload", out var p) ? p : null),
                "CloseOverlay" => new CloseOverlay(Str(map, "event")),
                "RunAction" => new RunAction(Str(map, "actionId") ?? ""),
                "MarkClean" => new MarkClean(),
                "MarkDirty" => new MarkDirty(),
                var other => Unknown(other),
            };
            if (step is not null) steps.Add(step);
        }
        return steps;
    }

    private static FlowStep? Unknown(string? type)
    {
        Log.LogWarning("Ignoring a flow step of unknown type '{Type}'", type);
        return null;
    }

    private static CatalogRestAction? RestActionOf(object? node)
    {
        if (node is not IDictionary<object, object> map) return null;
        return new CatalogRestAction(
            RestSourceRegistry.SourceOf(map.TryGetValue("source", out var s) ? s : null),
            Str(map, "successMessage"),
            Str(map, "resultPath"));
    }

    private static string? Str(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) ? v?.ToString() : null;

    // ── Wire ───────────────────────────────────────────────────────────────────────────────

    /// <summary>One catalogue entry on the wire, its flow LOWERED to commands (Java's ActionDtoMapper).</summary>
    public static ActionDto ToDto(CatalogAction action) => new(action.Id, ValidationRequired: false)
    {
        RestAction = action.RestAction is { } r
            ? new RestActionDto(MateuCatalogs.ToDto(r.Source), r.SuccessMessage, r.ResultPath)
            : null,
        Commands = action.Steps.Count == 0 ? null : action.Steps.Select(Lower).ToList(),
    };

    /// <summary>The whole catalogue on the wire (AppMetadataDto.ActionCatalogue).</summary>
    public static List<ActionDto> MapCatalogue(ActionCatalog catalog) => catalog.Actions.Select(ToDto).ToList();

    /// <summary>A step as the one wire command it is (Java's Step.toCommand).</summary>
    public static UICommandDto Lower(FlowStep step) => step switch
    {
        Navigate n => new UICommandDto(null!, "NavigateTo", n.Route),
        Emit e => new UICommandDto(null!, "DispatchEvent", new CustomEventDto(e.Event, e.Payload)),
        CloseOverlay { Event: null } => new UICommandDto(null!, "CloseModal", null),
        CloseOverlay c => new UICommandDto(null!, "CloseModal", new CustomEventDto(c.Event!, null)),
        RunAction r => new UICommandDto(null!, "RunAction", new Dictionary<string, object> { ["actionId"] = r.ActionId }),
        MarkClean => new UICommandDto(null!, "MarkAsClean", null),
        MarkDirty => new UICommandDto(null!, "MarkAsDirty", null),
        _ => throw new ArgumentOutOfRangeException(nameof(step)),
    };

    /// <summary>
    /// The catalogue entries an owner needs to carry: each of <paramref name="referenced"/> it does NOT
    /// own, closed transitively (a flow whose RunAction names another entry brings that one too).
    /// OWNER FIRST: an id in <paramref name="owned"/> is never replaced.
    /// </summary>
    public static List<CatalogAction> ReferencedBy(ActionCatalog catalog, IEnumerable<string> referenced,
        IEnumerable<string> owned)
    {
        var known = new HashSet<string>(owned);
        var found = new List<CatalogAction>();
        var pending = new Queue<string>(referenced);
        while (pending.Count > 0)
        {
            var id = pending.Dequeue();
            if (known.Contains(id) || catalog.Get(id) is not { } entry) continue;
            known.Add(id);
            found.Add(entry);
            foreach (var step in entry.Steps.OfType<RunAction>()) pending.Enqueue(step.ActionId);
        }
        return found;
    }
}
