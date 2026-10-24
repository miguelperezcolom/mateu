using System.Collections.Concurrent;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;

namespace Mateu.Core;

/// <summary>Version skew between a deployed UI and the renderers that call it (the transport-header
/// contract shared with Java and Python): every response of a Mateu endpoint carries
/// <c>X-Mateu-Build</c> — a fingerprint of the deployed UI, identical on every replica of one
/// release — and a renderer announces itself in <c>X-Mateu-Renderer</c>
/// (<c>&lt;name&gt;/&lt;version&gt; wire/&lt;major&gt;.&lt;minor&gt;</c>); a renderer speaking another
/// wire MAJOR is warned about once per distinct value, never refused. Nothing changes on the wire JSON.</summary>
internal sealed class VersionSkew
{
    /// <summary>The response header carrying the build id.</summary>
    public const string BuildHeader = "X-Mateu-Build";

    /// <summary>The request header a renderer announces itself in.</summary>
    public const string RendererHeader = "X-Mateu-Renderer";

    /// <summary>The environment variable overriding the computed build id.</summary>
    public const string BuildIdEnvironmentVariable = "MATEU_BUILD_ID";

    /// <summary>How many distinct renderer values are remembered (and so warned about) at most.</summary>
    internal const int MaxRememberedRenderers = 100;

    private readonly Lazy<string> _buildId;
    private readonly ConcurrentDictionary<string, byte> _warned = new(StringComparer.Ordinal);

    /// <param name="configured">The build id the host configured (null → MATEU_BUILD_ID, else computed).</param>
    /// <param name="registry">Whose registered UI types the computed id fingerprints.</param>
    /// <param name="specsDir">The specs directory served (null → the one the registries read).</param>
    public VersionSkew(string? configured, MateuRegistry registry, string? specsDir = null) =>
        _buildId = new Lazy<string>(() =>
            Sanitize(configured) ?? Sanitize(Environment.GetEnvironmentVariable(BuildIdEnvironmentVariable))
            ?? Compute(registry, specsDir ?? DevSpecs.SpecsDir));

    /// <summary>The build id, computed once on first use.</summary>
    public string BuildId => _buildId.Value;

    /// <summary>An override reduced to the contract's charset (<c>[A-Za-z0-9._-]</c>) and length (64);
    /// null when nothing usable is left.</summary>
    internal static string? Sanitize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var clean = new string(value.Trim().Where(IsAllowed).ToArray());
        if (clean.Length > 64) clean = clean[..64];
        return clean.Length == 0 ? null : clean;
    }

    /// <summary>First 16 hex chars of SHA-256 over: Mateu's own version, the module version id
    /// (MVID) of every assembly holding a registered UI type and those types' full names (sorted),
    /// and every YAML file of the specs directory (sorted by relative path). Deterministic across
    /// replicas of one release; different when a screen changes.</summary>
    internal static string Compute(MateuRegistry registry, string specsDir)
    {
        var sb = new StringBuilder();
        var mateu = typeof(VersionSkew).Assembly;
        sb.Append("mateu=")
            .Append(mateu.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion
                    ?? mateu.GetName().Version?.ToString() ?? "unknown")
            .Append('\n');
        var types = registry.RegisteredTypes.ToList();
        foreach (var mvid in types.Select(t => t.Assembly.ManifestModule.ModuleVersionId.ToString())
                     .Distinct().OrderBy(s => s, StringComparer.Ordinal))
            sb.Append("mvid=").Append(mvid).Append('\n');
        foreach (var name in types.Select(t => t.FullName ?? t.Name).Distinct().OrderBy(s => s, StringComparer.Ordinal))
            sb.Append("type=").Append(name).Append('\n');
        using var sha = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
        sha.AppendData(Encoding.UTF8.GetBytes(sb.ToString()));
        try
        {
            var root = Path.GetFullPath(specsDir);
            if (Directory.Exists(root))
            {
                var files = Directory.EnumerateFiles(root, "*.*", SearchOption.AllDirectories)
                    .Where(f => f.EndsWith(".yaml", StringComparison.OrdinalIgnoreCase)
                                || f.EndsWith(".yml", StringComparison.OrdinalIgnoreCase))
                    .Select(f => (Rel: Path.GetRelativePath(root, f).Replace('\\', '/'), Full: f))
                    .OrderBy(f => f.Rel, StringComparer.Ordinal);
                foreach (var (rel, full) in files)
                {
                    sha.AppendData(Encoding.UTF8.GetBytes("spec=" + rel + "\n"));
                    sha.AppendData(File.ReadAllBytes(full));
                    sha.AppendData("\n"u8);
                }
            }
        }
        catch (IOException)
        {
            // an unreadable specs directory leaves the id to the code half — never fails a request
        }
        catch (UnauthorizedAccessException)
        {
        }
        return Convert.ToHexString(sha.GetHashAndReset())[..16].ToLowerInvariant();
    }

    /// <summary>The wire MAJOR a renderer header announces (<c>… wire/2.1</c> → 2), null when the
    /// header is missing or garbled.</summary>
    internal static int? WireMajorOf(string? header) => WireOf(header)?.Major;

    private static (int Major, string Version)? WireOf(string? header)
    {
        if (string.IsNullOrWhiteSpace(header)) return null;
        // the first whitespace-delimited `wire/<major>[.<minor>]` token
        foreach (var token in header.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries))
        {
            if (!token.StartsWith("wire/", StringComparison.Ordinal)) continue;
            var version = token["wire/".Length..];
            var parts = version.Split('.');
            if (parts.Length > 2 || !parts.All(IsAsciiNumber)) continue;
            if (int.TryParse(parts[0], out var major)) return (major, version);
        }
        return null;
    }

    private static bool IsAsciiNumber(string s) => s.Length > 0 && s.All(char.IsAsciiDigit);

    private static bool IsAllowed(char c) => char.IsAsciiLetterOrDigit(c) || c is '.' or '_' or '-';

    /// <summary>The warning for <paramref name="header"/> the FIRST time this distinct value speaks
    /// another wire major than <paramref name="serverWireVersion"/>; null otherwise (same major,
    /// missing/garbled header, already warned, or the remembered set is full).</summary>
    public string? WarningFor(string? header, string serverWireVersion)
    {
        if (WireOf(header) is not { } wire) return null;
        var (major, version) = wire;
        var serverMajor = int.TryParse(serverWireVersion.Split('.')[0], out var s) ? s : (int?)null;
        if (serverMajor is null || major == serverMajor) return null;
        var value = MateuLogging.Safe(header!.Trim());
        if (_warned.Count >= MaxRememberedRenderers || !_warned.TryAdd(value, 0)) return null;
        return $"Renderer '{value}' speaks wire {version}; this server speaks {serverWireVersion}. "
               + "Upgrade the renderer or the server so their majors match.";
    }

    /// <summary>Whether <paramref name="path"/> is one of Mateu's endpoints (a <c>/mateu/</c> segment).</summary>
    public static bool IsMateuPath(string? path) =>
        path is not null && (path.Contains("/mateu/", StringComparison.Ordinal)
                             || path.EndsWith("/mateu", StringComparison.Ordinal));
}
