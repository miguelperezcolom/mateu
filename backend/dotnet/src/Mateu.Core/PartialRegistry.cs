using System.Collections.Concurrent;

namespace Mateu.Core;

/// <summary>
/// Resolves a partial's <c>ref</c> into the YAML nodes it stands for. (Mirrors Java's
/// <c>io.mateu.core.application.runaction.PartialRegistry</c> and Python's <c>PartialRegistry</c>.)
/// </summary>
/// <remarks>
/// <para>A partial is authored exactly like a page — one component, or a <c>content:</c> list of
/// them — but has no route and no chrome. Definitions live in <c>&lt;specs&gt;/partials/&lt;ref&gt;.yaml</c>;
/// a ref that already ends in <c>.yaml</c> is honoured as a path relative to the specs directory,
/// so a partial can live next to the pages that use it.</para>
/// <para>Refs are resolved to raw YAML nodes rather than to built components: the builder splices
/// them into the parent's node list and builds once, which is what lets a partial standing for
/// several components behave like those components rather than like a wrapper around them.</para>
/// <para>A ref that resolves to nothing is <b>not</b> fatal — the partial renders as no content. A
/// page is not worth taking down over one piece of it, and the alternative turns a typo into a 500
/// on every request to every page that mentions the ref.</para>
/// <para>Unlike the Java server, a ref here cannot name a class: the ports carry the declarative
/// form only, as with <c>@Overline</c>.</para>
/// </remarks>
public sealed class PartialRegistry : ISpecsCache
{
    /// <summary>The registry the YAML builder uses when a caller does not supply one.</summary>
    public static PartialRegistry Default { get; } = new();

    private static readonly IReadOnlyList<object> None = [];

    private readonly ConcurrentDictionary<string, IReadOnlyList<object>> _byRef = new();
    private readonly ConcurrentDictionary<string, IReadOnlyList<object>> _registered = new();
    private readonly string _dir;

    public PartialRegistry(string? dir = null)
    {
        _dir = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR")
                   ?? Path.Combine("specs", "ui");
        DevSpecs.Register(this);
    }

    /// <summary>Dev mode: a spec changed — the YAML partials are read again (code registrations stay).</summary>
    public void InvalidateSpecs() => _byRef.Clear();

    /// <summary>Contribute a partial programmatically. A registration wins over a file of the same
    /// name — the same precedence a route registration has over the route convention.</summary>
    public void Register(string reference, IReadOnlyList<object> nodes)
    {
        _registered[reference] = nodes;
        _byRef.TryRemove(reference, out _);
    }

    /// <summary>Forget everything registered in code, and every cached lookup. Tests.</summary>
    public void Reset()
    {
        _registered.Clear();
        _byRef.Clear();
    }

    /// <summary>The YAML nodes <c>reference</c> stands for; empty when it resolves to nothing.</summary>
    public IReadOnlyList<object> Resolve(string? reference)
    {
        if (string.IsNullOrWhiteSpace(reference)) return None;
        if (_registered.TryGetValue(reference, out var fromCode)) return fromCode;
        return _byRef.GetOrAdd(reference, FromYaml);
    }

    /// <summary>The paths, relative to the specs directory, a YAML partial <c>reference</c> may live
    /// at, in lookup order. A short name is <c>partials/&lt;ref&gt;.yaml</c> (or <c>.yml</c>); an explicit
    /// <c>.yaml</c>/<c>.yml</c> path is relative to the specs directory, and the classpath spelling Java
    /// takes (<c>specs/ui/partials/x.yaml</c>, leading slash ignored) is honoured too — one definition
    /// resolves in every backend.</summary>
    public static IReadOnlyList<string> CandidatePaths(string reference)
    {
        if (string.IsNullOrWhiteSpace(reference)) return [];
        if (!IsYamlPath(reference))
            return [Path.Combine("partials", reference + ".yaml"), Path.Combine("partials", reference + ".yml")];
        var path = reference.TrimStart('/');
        return path.StartsWith("specs/ui/", StringComparison.Ordinal) ? [path, path["specs/ui/".Length..]] : [path];
    }

    /// <summary>Whether a ref names a file by path rather than by short name.</summary>
    public static bool IsYamlPath(string reference) =>
        reference.EndsWith(".yaml", StringComparison.OrdinalIgnoreCase)
        || reference.EndsWith(".yml", StringComparison.OrdinalIgnoreCase);

    /// <summary>What identifies the partial a ref names — the file it resolves to (the ref itself when
    /// registered in code or missing), so two spellings of one file are one link of a cycle.</summary>
    public string Key(string reference)
    {
        if (_registered.ContainsKey(reference)) return reference;
        return CandidatePaths(reference).FirstOrDefault(c => File.Exists(Path.Combine(_dir, c)))
               ?.Replace('\\', '/') ?? reference;
    }

    private IReadOnlyList<object> FromYaml(string reference)
    {
        var relative = CandidatePaths(reference).FirstOrDefault(c => File.Exists(Path.Combine(_dir, c)));
        if (relative is null) return None;
        var path = Path.Combine(_dir, relative);
        try
        {
            var root = YamlComponentBuilder.Deserialize(File.ReadAllText(path));
            if (root is null) return None;
            // Only the "several components" document (no `type`, or the `type: Partial` header, and a
            // `content:` list) is spliced — its own access keys kept on a wrapper. A typed root IS
            // one component and is kept whole, access keys, id and style included: unwrapping a
            // `type: Card, eyesOnly: …, content: [...]` dropped the card and let its content reach
            // every caller.
            if (IsPartialDocument(root, out var seq))
                return Guarded((IDictionary<object, object>)root, seq.ToList());
            return [root];
        }
        catch (Exception e)
        {
            // a partial that cannot be read is left out — but said, with its file and the reason
            Microsoft.Extensions.Logging.LoggerExtensions.LogWarning(MateuLogging.For("Mateu.Partials"),
                "Could not read the partial '{Ref}': {Path}: {Reason}. It is left out of the page.",
                reference, relative, e.Message);
            return None;
        }
    }

    private const int MaxComposeDepth = 20;

    /// <summary>The access keys a partial document or a <c>type: Partial</c> reference may carry.</summary>
    private static readonly string[] AccessKeys = ["eyesOnly", "readOnlyUnless", "disabledUnless"];

    /// <summary>Whether a partial file's root is the "several components" document — no <c>type</c>
    /// (or the <c>type: Partial</c> header) and a <c>content:</c> list.</summary>
    internal static bool IsPartialDocument(object? root, out IEnumerable<object> content)
    {
        content = [];
        if (root is not IDictionary<object, object> map || map.ContainsKey("ref")) return false;
        if (map.TryGetValue("type", out var type) && type is not null && !"Partial".Equals(type as string))
            return false;
        if (!map.TryGetValue("content", out var c) || c is not IEnumerable<object> seq || c is string) return false;
        content = seq;
        return true;
    }

    /// <summary><c>items</c> under the access keys <c>holder</c> declares (a partial document's root,
    /// or the <c>type: Partial</c> reference itself): stacked in a <c>VerticalLayout</c> carrying
    /// them, so the access pass applies them to all of it — splicing them bare dropped the keys. The
    /// same items when the holder declares none.</summary>
    internal static List<T> Guarded<T>(IDictionary<object, object> holder, List<T> items)
    {
        if (items.Count == 0) return items;
        var keys = AccessKeys.Where(holder.ContainsKey).ToList();
        if (keys.Count == 0) return items;
        var stack = new Dictionary<object, object> { ["type"] = "VerticalLayout" };
        foreach (var key in keys) stack[key] = holder[key];
        stack["content"] = items.Cast<object>().ToList();
        return [(T)(object)stack];
    }

    /// <summary>The tree with its partials inlined as SOURCE — each <c>{type: Partial, ref: …}</c>
    /// node replaced by the partial's own nodes, recursively — the twin of Java's <c>YamlPartials</c>.
    /// Done before anything else reads a definition, so the access keys (<c>eyesOnly:</c>,
    /// <c>readOnlyUnless:</c>, <c>disabledUnless:</c>, <c>access:</c>) and <c>${i18n.…}</c> texts of
    /// a partial are applied per caller like inline ones: built as components first, a partial had
    /// already lost them and a section guarded in it reached every caller. In a list the partial's
    /// nodes are spliced; in a one-component slot several are stacked in a <c>VerticalLayout</c>. A
    /// ref that resolves to nothing is left for the builder (no content).</summary>
    public object? Compose(object? tree) => MentionsPartial(tree) ? ComposeNode(tree, []) : tree;

    private static bool MentionsPartial(object? node) => node switch
    {
        IDictionary<object, object> map => IsPartialNode(map) || map.Values.Any(MentionsPartial),
        string => false,
        IEnumerable<object> seq => seq.Any(MentionsPartial),
        _ => false,
    };

    private static bool IsPartialNode(IDictionary<object, object> map) =>
        map.TryGetValue("type", out var type) && "Partial".Equals(type as string)
        && map.TryGetValue("ref", out var reference) && reference is string s && !string.IsNullOrWhiteSpace(s);

    private object? ComposeNode(object? node, List<string> chain)
    {
        switch (node)
        {
            case IDictionary<object, object> map:
            {
                var outMap = new Dictionary<object, object>();
                foreach (var (name, value) in map)
                {
                    var items = ItemsOf(value, chain);
                    if (items is null) outMap[name] = ComposeNode(value, chain)!;
                    else if (items.Count == 1) outMap[name] = items[0];
                    else if (items.Count > 1)
                        outMap[name] = new Dictionary<object, object>
                        {
                            ["type"] = "VerticalLayout",
                            ["content"] = items,
                        };
                }
                return outMap;
            }
            case string:
                return node;
            case IEnumerable<object> seq:
            {
                var outList = new List<object>();
                foreach (var child in seq)
                {
                    var items = ItemsOf(child, chain);
                    if (items is null) outList.Add(ComposeNode(child, chain)!);
                    else outList.AddRange(items);
                }
                return outList;
            }
            default:
                return node;
        }
    }

    /// <summary>The composed nodes a partial node stands for; null when <c>node</c> is not a partial
    /// or names nothing (left to the builder); empty for a cycle or a nesting too deep.</summary>
    private List<object>? ItemsOf(object? node, List<string> chain)
    {
        if (node is not IDictionary<object, object> map || !IsPartialNode(map)) return null;
        var reference = (string)map["ref"];
        var nodes = Resolve(reference);
        if (nodes.Count == 0) return null;
        var key = Key(reference);
        if (chain.Contains(key) || chain.Count >= MaxComposeDepth) return [];
        chain.Add(key);
        try
        {
            var outList = new List<object>();
            foreach (var child in nodes)
            {
                var items = ItemsOf(child, chain);
                if (items is null) outList.Add(ComposeNode(child, chain)!);
                else outList.AddRange(items);
            }
            // the reference's own access keys guard everything the partial stands for
            return Guarded(map, outList);
        }
        finally
        {
            chain.RemoveAt(chain.Count - 1);
        }
    }
}
