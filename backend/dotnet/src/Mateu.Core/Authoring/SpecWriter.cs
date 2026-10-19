using System.Text;
using System.Text.RegularExpressions;
using Mateu.Uidl;

namespace Mateu.Core.Authoring;

/// <summary>Writes an authored definition into the specs directory — the <c>mateu_save_spec</c>
/// tool, only ever offered in development mode. The path rule is normative (the same in Java, Python
/// and the sidecar): a relative <c>.yaml</c>/<c>.yml</c> path with no <c>..</c>, <c>.</c> or empty
/// segment, no backslash, no drive letter, at most 255 characters, that stays inside the specs
/// directory once symbolic links are followed. C# twin of Java's <c>SpecWriter</c>.</summary>
internal static class SpecWriter
{
    private static readonly Regex Drive = new("^[A-Za-z]:", RegexOptions.CultureInvariant);

    /// <summary>Whether <paramref name="path"/> is acceptable before touching the disk.</summary>
    public static bool IsAcceptable(string? path)
    {
        if (string.IsNullOrWhiteSpace(path) || path.Length > 255) return false;
        if (path.Contains('\0') || path.Contains('\\') || path.StartsWith('/') || Drive.IsMatch(path)) return false;
        if (!(path.EndsWith(".yaml", StringComparison.Ordinal) || path.EndsWith(".yml", StringComparison.Ordinal))) return false;
        foreach (var segment in path.Split('/'))
            if (segment.Length == 0 || segment == "." || segment == "..") return false;
        return true;
    }

    /// <summary>The kinds an agent may save: what a screen is made of, never what a request is made of.</summary>
    private static readonly HashSet<string> SavableKinds = ["component", "envelope", "partial", "components"];

    /// <summary>File names (any extension, any folder) the catalogues are read from by convention.</summary>
    private static readonly HashSet<string> CatalogueNames = ["sources", "routes", "actions", "types", "project"];

    /// <summary>Folders the catalogues are read from by convention.</summary>
    private static readonly HashSet<string> CatalogueFolders = ["environments", "translations"];

    /// <summary>The request keys a surface naming a catalogue source by <c>ref</c> may not override.</summary>
    private static readonly string[] RequestKeys = ["url", "baseUrl", "method", "headers", "body", "proxy"];

    /// <summary>The message of a definition that would decide a request (shown as written).</summary>
    public const string RequestRefusal =
        "A definition saved by an agent may not reference a secret, proxy a request through the"
        + " server or override the request of a catalogue source; declare those in sources.yaml by hand.";

    /// <summary>Whether <paramref name="path"/> names a catalogue file (<c>sources.yaml</c>,
    /// <c>environments/…</c>…): an agent never writes those (Java's <c>SpecWriter.isCatalogueFile</c>).</summary>
    public static bool IsCatalogueFile(string? path)
    {
        if (path is null) return false;
        var segments = path.Split('/');
        if (segments.Length > 1 && CatalogueFolders.Contains(segments[0])) return true;
        var name = segments[^1];
        var dot = name.LastIndexOf('.');
        return CatalogueNames.Contains(dot >= 0 ? name[..dot] : name);
    }

    /// <summary>The message of a refused catalogue file (shown as written).</summary>
    public static string CatalogueRefusal(string? path) =>
        "Refused path " + UidlValidator.Quote(path ?? "")
        + ": catalogue files (sources, routes, actions, types, project, environments, translations) are written by hand.";

    /// <summary>Why an agent may not save this definition, or null when it may (Java's
    /// <c>SpecWriter.agentRefusal</c>): only pages, envelopes, partials and business-component
    /// catalogues, and none that references a secret, marks a request <c>proxy: true</c> or overrides
    /// the request of a source it names by <c>ref</c> — in dev mode an agent could otherwise re-point a
    /// proxied source at its own server and have Mateu send it the secret.</summary>
    public static string? AgentRefusal(string? kind, string? yaml)
    {
        if (kind is not null && !SavableKinds.Contains(kind))
            return "Only a page, a partial or a business-component catalogue can be saved by an agent; a "
                   + UidlValidator.Quote(kind) + " definition is written by hand.";
        YNode? tree;
        try
        {
            tree = YamlTree.Compose(yaml ?? "");
        }
        catch (Exception)
        {
            return null; // not YAML: the validation report already says so
        }
        if (CarriesARequest(tree, new HashSet<YNode>(ReferenceEqualityComparer.Instance))) return RequestRefusal;
        // R6: a saved spec is served through the ordinary (trusted) render path, so it may not carry
        // what the untrusted strip keeps out of an agent's pushed screen
        System.Text.Json.Nodes.JsonNode? json;
        try
        {
            var budget = MaxExpandedNodes;
            json = ToJson(tree, new HashSet<YNode>(ReferenceEqualityComparer.Instance), ref budget);
        }
        catch (InvalidOperationException)
        {
            return ScriptRefusal; // aliases expanding past any page's size: not checkable, not saved
        }
        return UntrustedDefinition.ScriptCapable(json) ? ScriptRefusal : null;
    }

    /// <summary>How many nodes the alias-expanded tree may have before the check gives up (refusing).</summary>
    private const int MaxExpandedNodes = 100_000;

    /// <summary>The message of a definition that would run code in the browser (shown as written).</summary>
    public const string ScriptRefusal =
        "A definition saved by an agent may not run code in the browser: no event-handler, import or srcdoc attribute, "
        + "no raw-HTML or script-capable element, no javascript: url, RunJS rule or action js, and no MicroFrontend "
        + "loaded from another server.";

    /// <summary>The composed tree as JSON (scalars as text; the last of duplicate keys wins, as the
    /// loader reads it; an alias inside its own anchor is cut).</summary>
    private static System.Text.Json.Nodes.JsonNode? ToJson(YNode? node, HashSet<YNode> path, ref int budget)
    {
        if (--budget < 0) throw new InvalidOperationException("too large");
        switch (node)
        {
            case YScalar scalar:
                return System.Text.Json.Nodes.JsonValue.Create(scalar.Value);
            case YSequence sequence:
            {
                if (!path.Add(sequence)) return null;
                var array = new System.Text.Json.Nodes.JsonArray();
                foreach (var item in sequence.Items) array.Add(ToJson(item, path, ref budget));
                path.Remove(sequence);
                return array;
            }
            case YMapping mapping:
            {
                if (!path.Add(mapping)) return null;
                var obj = new System.Text.Json.Nodes.JsonObject();
                foreach (var entry in mapping.Entries)
                {
                    var key = entry.Key is YScalar k ? k.Value : "";
                    obj[key] = ToJson(entry.Value, path, ref budget);
                }
                path.Remove(mapping);
                return obj;
            }
            default:
                return null;
        }
    }

    private static bool CarriesARequest(YNode? node, HashSet<YNode> seen)
    {
        switch (node)
        {
            case YScalar scalar:
                return scalar.Value.Contains("${secret.", StringComparison.Ordinal);
            case YSequence sequence:
                if (!seen.Add(sequence)) return false; // an alias: already walked
                return sequence.Items.Any(item => CarriesARequest(item, seen));
            case YMapping mapping:
                if (!seen.Add(mapping)) return false;
                string? Text(string key) => mapping.Entries
                    .Where(e => e.Key is YScalar k && k.Value == key)
                    .Select(e => e.Value is YScalar v ? v.Value : "")
                    .FirstOrDefault();
                bool Has(string key) => mapping.Entries.Any(e => e.Key is YScalar k && k.Value == key);
                if (string.Equals(Text("proxy")?.Trim(), "true", StringComparison.OrdinalIgnoreCase)) return true;
                if (!string.IsNullOrWhiteSpace(Text("ref")) && RequestKeys.Any(Has)) return true;
                return mapping.Entries.Any(e => CarriesARequest(e.Key, seen) || CarriesARequest(e.Value, seen));
            default:
                return false;
        }
    }

    /// <summary>The message of a refused path (shown as written).</summary>
    public static string Refusal(string? path) =>
        "Invalid path " + UidlValidator.Quote(path ?? "")
        + ": give a relative .yaml or .yml path inside the specs directory (no \"..\", no absolute path).";

    /// <summary>Writes <paramref name="yaml"/> at <paramref name="path"/> under <paramref name="root"/>,
    /// creating the folders it needs; the number of bytes written.</summary>
    /// <exception cref="UserFacingException">the path is refused</exception>
    public static int Write(string root, string path, string yaml)
    {
        if (!IsAcceptable(path)) throw new UserFacingException(Refusal(path));
        var @base = Path.TrimEndingDirectorySeparator(Path.GetFullPath(root));
        var target = Path.GetFullPath(Path.Combine(@base, path));
        if (!IsUnder(target, @base)) throw new UserFacingException(Refusal(path));
        var realBase = RealPath(@base);
        var existing = Path.GetDirectoryName(target);
        while (existing is not null && !Directory.Exists(existing) && !File.Exists(existing))
            existing = Path.GetDirectoryName(existing);
        if (existing is null || !IsUnder(RealPath(existing), realBase)) throw new UserFacingException(Refusal(path));
        if (new FileInfo(target).LinkTarget is not null && !IsUnder(RealPath(target), realBase))
            throw new UserFacingException(Refusal(path));
        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        var bytes = new UTF8Encoding(false).GetBytes(yaml);
        File.WriteAllBytes(target, bytes);
        return bytes.Length;
    }

    private static bool IsUnder(string child, string parent) =>
        child == parent
        || child.StartsWith(Path.TrimEndingDirectorySeparator(parent) + Path.DirectorySeparatorChar, StringComparison.Ordinal);

    /// <summary><paramref name="path"/> with every symbolic link along it followed (Java's
    /// <c>toRealPath</c>; a component that does not exist is kept as written).</summary>
    internal static string RealPath(string path, int depth = 0)
    {
        if (depth > 40) throw new IOException("Too many levels of symbolic links: " + path);
        path = Path.GetFullPath(path);
        var root = Path.GetPathRoot(path) ?? "/";
        var current = root;
        foreach (var part in path[root.Length..].Split(Path.DirectorySeparatorChar, StringSplitOptions.RemoveEmptyEntries))
        {
            var next = Path.Combine(current, part);
            FileSystemInfo info = Directory.Exists(next) ? new DirectoryInfo(next) : new FileInfo(next);
            if (info.LinkTarget is { } link)
            {
                var resolved = Path.IsPathRooted(link) ? link : Path.Combine(current, link);
                next = RealPath(resolved, depth + 1);
            }
            current = next;
        }
        return Path.TrimEndingDirectorySeparator(current) is { Length: > 0 } trimmed ? trimmed : current;
    }
}
