using System.Text.RegularExpressions;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// Deployment environments for the REST source catalogue (the C# mirror of Java's Environments): a
/// <c>type: Environment</c> file (or <c>environments/&lt;name&gt;.yaml</c> under the specs directory)
/// re-points named sources — base url, url, headers, proxy flag — WITHOUT editing sources.yaml, and
/// the ACTIVE one (MATEU_ENVIRONMENT, or MateuOptions.Environment) is overlaid on the merged
/// catalogue by <see cref="RestSourceRegistry"/>, so the wire, the proxy and the export all see it.
/// Only the DEPLOYMENT of an endpoint is overridable; secrets never belong here — a literal
/// credential header is warned about (write <c>${secret.X}</c>, resolved by the proxy).
/// </summary>
public static class Environments
{
    public const string EnvVar = "MATEU_ENVIRONMENT";

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    /// <summary>The active environment's name from MATEU_ENVIRONMENT, or null.</summary>
    public static string? ActiveName()
    {
        var name = Environment.GetEnvironmentVariable(EnvVar);
        return string.IsNullOrWhiteSpace(name) ? null : name.Trim();
    }

    /// <summary>Every environment declared under <paramref name="dir"/>, by name.</summary>
    public static Dictionary<string, MateuEnvironment> All(string dir)
    {
        var byName = new Dictionary<string, MateuEnvironment>();
        if (!Directory.Exists(dir)) return byName;
        foreach (var file in Directory.EnumerateFiles(dir, "*.*", SearchOption.AllDirectories)
                     .Where(f => f.EndsWith(".yaml") || f.EndsWith(".yml")).Order(StringComparer.Ordinal))
        {
            try
            {
                var relative = Path.GetRelativePath(dir, file).Replace('\\', '/');
                if (Parse(Yaml.Deserialize<object?>(File.ReadAllText(file)), relative) is { } env) byName[env.Name] = env;
            }
            catch (Exception e)
            {
                MateuLogging.For("Mateu.RestSources").LogWarning(e, "Environment {File} skipped: {Error}", file, e.Message);
            }
        }
        return byName;
    }

    /// <summary>A parsed file as an environment, or null when it is not one.</summary>
    public static MateuEnvironment? Parse(object? root, string? relativePath)
    {
        if (root is not IDictionary<object, object> map) return null;
        var type = map.TryGetValue("type", out var t) ? t?.ToString() ?? "" : "";
        var conventional = relativePath?.StartsWith("environments/", StringComparison.Ordinal) == true;
        if (type != "Environment" && !(conventional && type.Length == 0)) return null;
        var name = map.TryGetValue("name", out var n) ? n?.ToString() ?? "" : "";
        if (string.IsNullOrWhiteSpace(name) && relativePath is not null)
            name = Regex.Replace(Path.GetFileName(relativePath), @"\.ya?ml$", "");
        var sources = new Dictionary<string, SourceOverride>();
        if (map.TryGetValue("sources", out var s) && s is IDictionary<object, object> declared)
            foreach (var (key, value) in declared)
            {
                if (value is not IDictionary<object, object> o) continue;
                string? Str(string k) => o.TryGetValue(k, out var v) ? v?.ToString() : null;
                var headers = new Dictionary<string, string>();
                if (o.TryGetValue("headers", out var h) && h is IDictionary<object, object> hm)
                    foreach (var (hk, hv) in hm) headers[hk.ToString()!] = hv?.ToString() ?? "";
                WarnOnLiteralSecrets(relativePath ?? name, key.ToString()!, headers);
                sources[key.ToString()!] = new SourceOverride(
                    Str("baseUrl"), Str("url"), headers,
                    bool.TryParse(Str("proxy"), out var proxy) ? proxy : null);
            }
        return new MateuEnvironment(name.Trim(), sources);
    }

    private static void WarnOnLiteralSecrets(string file, string source, Dictionary<string, string> headers)
    {
        foreach (var (header, value) in headers)
        {
            var lower = header.ToLowerInvariant();
            var credential = lower == "authorization" || lower.Contains("api-key") || lower.Contains("apikey")
                             || lower.Contains("token") || lower.Contains("secret");
            if (credential && !value.Contains("${"))
                MateuLogging.For("Mateu.RestSources").LogWarning(
                    "Environment {File} gives source '{Source}' a literal '{Header}' header: never put a secret in an"
                    + " environment file — write ${{secret.X}} and set MATEU_SECRET_X on the server", file, source, header);
        }
    }

    /// <summary>The catalogue with the environment named <paramref name="name"/> (default: the active
    /// one) overlaid; unchanged when none is active or the name is unknown (warned).</summary>
    public static RestSourceCatalog OverlayActive(RestSourceCatalog catalog, string dir, string? name = null)
    {
        name ??= ActiveName();
        if (name is null) return catalog;
        if (!All(dir).TryGetValue(name, out var env))
        {
            MateuLogging.For("Mateu.RestSources").LogWarning(
                "Environment '{Name}' is active but no environment file declares it — the REST sources stay as authored", name);
            return catalog;
        }
        return Overlay(catalog, env);
    }

    /// <summary>The catalogue with <paramref name="env"/>'s overrides applied to the entries it names.</summary>
    public static RestSourceCatalog Overlay(RestSourceCatalog catalog, MateuEnvironment? env)
    {
        if (env is null || env.Sources.Count == 0) return catalog;
        var known = catalog.Sources.Select(e => e.Name).ToHashSet();
        foreach (var unknown in env.Sources.Keys.Where(k => !known.Contains(k)))
            MateuLogging.For("Mateu.RestSources").LogWarning(
                "Environment '{Env}' overrides source '{Source}', which the catalogue does not declare", env.Name, unknown);
        return new RestSourceCatalog(catalog.Sources
            .Select(e => env.Sources.TryGetValue(e.Name, out var o) ? Overlay(e, o) : e)
            .ToList());
    }

    internal static RestSourceEntry Overlay(RestSourceEntry entry, SourceOverride o)
    {
        var source = entry.Source ?? new RestDataSource();
        var url = source.Url;
        if (!string.IsNullOrWhiteSpace(o.Url)) url = o.Url;
        else if (!string.IsNullOrWhiteSpace(o.BaseUrl)) url = Rebase(url, o.BaseUrl!);
        var headers = new Dictionary<string, string>(source.Headers ?? new Dictionary<string, string>());
        foreach (var (k, v) in o.Headers ?? new Dictionary<string, string>()) headers[k] = v;
        return entry with
        {
            Source = source with { Url = url, Headers = headers, Proxy = o.Proxy ?? source.Proxy },
        };
    }

    /// <summary><paramref name="url"/> moved to <paramref name="baseUrl"/>: an absolute url keeps its
    /// path and query under the new origin (a base with a path of its own prefixes it); a relative url
    /// gets the base prepended. Placeholders survive untouched.</summary>
    public static string Rebase(string? url, string baseUrl)
    {
        var b = baseUrl.EndsWith('/') ? baseUrl[..^1] : baseUrl;
        if (string.IsNullOrWhiteSpace(url)) return b;
        var schemeEnd = url.IndexOf("://", StringComparison.Ordinal);
        string rest;
        if (schemeEnd > 0)
        {
            var pathStart = url.IndexOf('/', schemeEnd + 3);
            rest = pathStart < 0 ? "" : url[pathStart..];
        }
        else rest = url.StartsWith('/') ? url : "/" + url;
        return b + rest;
    }
}
