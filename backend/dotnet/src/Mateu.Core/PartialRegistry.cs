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
            // `content:` holds several; a file that is just a component IS the partial.
            if (root is IDictionary<object, object> map
                && map.TryGetValue("content", out var content)
                && content is IEnumerable<object> seq)
                return seq.ToList();
            return [root];
        }
        catch
        {
            return None;
        }
    }
}
