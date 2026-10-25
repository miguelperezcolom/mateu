using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Mateu.Core;

/// <summary>Every Mateu UI as an installable Progressive Web App — the .NET twin of Java's
/// <c>io.mateu.core.infra.Pwa</c>, member for member: Chrome and Edge offer "Install app" on the
/// desktop (its own window and icon), phones add it to the home screen, and the shell opens offline.
///
/// <para>Three parts, all under <c>&lt;baseUrl&gt;/mateu/v3/pwa/</c> on a served app: the W3C web app
/// manifest (<see cref="Manifest"/>, derived from the SAME members as the mobile app's manifest,
/// <see cref="MobileManifest.Derive"/>, so a rename reaches both; icons fall back to Mateu's own), the
/// service worker (<see cref="Worker"/>: network first, one cache per build, never the API or the
/// REST-source data; served with <c>Service-Worker-Allowed</c> so it controls the whole UI) and the
/// external script that registers it (<see cref="Register"/>: the page has no inline script). The
/// worker, the script and the icons are byte-identical copies of Java's, embedded in Mateu.Core.</para>
///
/// <para>ON by default. <c>MateuOptions.Pwa = false</c> or <c>MATEU_PWA_ENABLED=false</c> turns it
/// off; it is also off in development mode (<see cref="DevSpecs.Enabled"/>), where a cached shell
/// would only get in the way of live reload. Off, the page carries none of it and the worker's URL
/// answers a worker that unregisters itself, so a browser that installed it before lets it go.</para></summary>
internal static class Pwa
{
    /// <summary>The environment variable that turns it off (<c>false</c>). Java: <c>mateu.pwa.enabled</c>.</summary>
    public const string EnabledEnvVar = "MATEU_PWA_ENABLED";

    /// <summary>Where the files live, under a UI's base URL.</summary>
    public const string Dir = "/mateu/v3/pwa/";

    public const string Manifest = "manifest.webmanifest";
    public const string Worker = "sw.js";
    public const string Register = "register.js";
    public const string Icon192 = "icon-192.png";
    public const string Icon512 = "icon-512.png";
    public const string IconMaskable = "icon-maskable-512.png";

    /// <summary>The worker that removes itself, answered at the worker's URL when this is switched off.</summary>
    public const string WorkerOff = "sw-off.js";

    /// <summary>The splash-screen background of an installed app.</summary>
    public const string BackgroundColor = "#ffffff";

    /// <summary>The logical name prefix of the embedded files (Mateu.Core.csproj).</summary>
    private const string ResourcePrefix = "Mateu.Pwa.";

    private static readonly Regex HexColor =
        new(@"\A#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\z");

    private static readonly Regex Scheme = new(@"\A[a-z][a-z0-9+.-]*:.*\z");

    /// <summary>Whether the UIs are served as PWAs: unless <paramref name="configured"/>
    /// (<c>MateuOptions.Pwa</c>) is false — or, when it is null, <c>MATEU_PWA_ENABLED</c> is false —
    /// and not in development mode.</summary>
    public static bool Enabled(bool? configured = null) =>
        (configured ?? !string.Equals(Environment.GetEnvironmentVariable(EnabledEnvVar)?.Trim(), "false",
            StringComparison.OrdinalIgnoreCase))
        && !DevSpecs.Enabled;

    /// <summary>Whether <paramref name="path"/> is one of the files under <see cref="Dir"/>.</summary>
    public static bool IsEndpoint(string? path) => path is not null && path.Contains(Dir, StringComparison.Ordinal);

    /// <summary>The scope of a UI at <paramref name="baseUrl"/>: <c>/</c> for the root UI, <c>/crm</c>
    /// otherwise (no trailing slash: the UI's own page is <c>/crm</c>, and it must be inside).</summary>
    public static string ScopeOf(string? baseUrl)
    {
        var p = baseUrl is null ? "" : baseUrl.Trim();
        while (p.StartsWith('/')) p = p[1..];
        while (p.EndsWith('/')) p = p[..^1];
        return "/" + p;
    }

    /// <summary>The folder of the files of a served UI: <c>/mateu/v3/pwa/</c>, <c>/crm/mateu/v3/pwa/</c>.</summary>
    public static string DirOf(string? baseUrl)
    {
        var scope = ScopeOf(baseUrl);
        return (scope == "/" ? "" : scope) + Dir;
    }

    // ------------------------------------------------------------------------------------------
    // The web app manifest
    // ------------------------------------------------------------------------------------------

    /// <summary>The web app manifest as JSON — the same members, order and bytes as Java's
    /// <c>Pwa.manifestJson</c>.</summary>
    /// <param name="source">What the UI declares (<see cref="MobileManifest.Derive"/>); null when
    /// unknown (then no theme colour and no declared icon).</param>
    /// <param name="startUrl">The page the installed app opens (also its <c>id</c>).</param>
    /// <param name="scope">The URLs the installed app owns.</param>
    public static string ManifestJson(MobileManifest.Derived? source, string startUrl, string scope)
    {
        var derived = source ?? MobileManifest.Derive(null);
        using var buffer = new MemoryStream();
        using (var w = new Utf8JsonWriter(buffer, new JsonWriterOptions
               {
                   Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
               }))
        {
            w.WriteStartObject();
            w.WriteString("id", startUrl);
            w.WriteString("name", derived.Name);
            w.WriteString("short_name", derived.ShortName);
            w.WriteString("start_url", startUrl);
            w.WriteString("scope", scope);
            w.WriteString("display", "standalone");
            w.WriteString("background_color", BackgroundColor);
            if (ThemeColor(source) is { } theme) w.WriteString("theme_color", theme);
            w.WriteStartArray("icons");
            foreach (var icon in Icons(source))
            {
                w.WriteStartObject();
                foreach (var (name, value) in icon) w.WriteString(name, value);
                w.WriteEndObject();
            }
            w.WriteEndArray();
            w.WriteEndObject();
        }
        return Encoding.UTF8.GetString(buffer.ToArray());
    }

    /// <summary>The theme colour the UI declares (the mobile manifest's), when it is a hex colour.</summary>
    public static string? ThemeColor(MobileManifest.Derived? source) =>
        source?.ThemeColor is { } value && HexColor.IsMatch(value) ? value : null;

    /// <summary>The icon the UI declares for itself — the mobile manifest's, from
    /// <c>MATEU_MOBILE_ICON</c> or <c>[MobileApp(Icon)]</c> — normalised to a URL a manifest may
    /// carry, or null. Accepted: an https URL, a path on the UI's origin (a relative one is taken from
    /// the origin's root), a raster or SVG <c>data:image/…</c> URI. Refused: plain http, other
    /// schemes, <c>.ico</c>.</summary>
    public static string? DeclaredIcon(MobileManifest.Derived? source)
    {
        if (source is null || string.IsNullOrWhiteSpace(source.Icon)) return null;
        var icon = source.Icon.Trim();
        var lower = icon.ToLowerInvariant();
        if (lower.StartsWith("data:", StringComparison.Ordinal)) return IconType(icon) is not null ? icon : null;
        if (lower.Contains('<') || lower.Contains('"') || lower.Contains(' ')) return null;
        if (PathOf(lower).EndsWith(".ico", StringComparison.Ordinal)) return null;
        if (lower.StartsWith("https://", StringComparison.Ordinal)) return icon;
        if (lower.StartsWith("//", StringComparison.Ordinal) || Scheme.IsMatch(lower))
            return null; // protocol-relative, http:, javascript:…
        return icon.StartsWith('/') ? icon : "/" + icon;
    }

    private static string PathOf(string url)
    {
        var cut = url.Length;
        foreach (var c in new[] { '?', '#' })
        {
            var at = url.IndexOf(c);
            if (at >= 0 && at < cut) cut = at;
        }
        return url[..cut];
    }

    /// <summary>The MIME type of an icon URL, when it is one a browser shows as an app icon; "" for a
    /// URL whose type is unknown; null for a data URI that is not an image a browser shows.</summary>
    internal static string? IconType(string icon)
    {
        var lower = icon.ToLowerInvariant();
        if (lower.StartsWith("data:", StringComparison.Ordinal))
        {
            foreach (var type in new[] { "image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml" })
            {
                if (lower.StartsWith("data:" + type + ";", StringComparison.Ordinal)
                    || lower.StartsWith("data:" + type + ",", StringComparison.Ordinal))
                    return type;
            }
            return null;
        }
        var path = PathOf(lower);
        if (path.EndsWith(".png", StringComparison.Ordinal)) return "image/png";
        if (path.EndsWith(".svg", StringComparison.Ordinal)) return "image/svg+xml";
        if (path.EndsWith(".webp", StringComparison.Ordinal)) return "image/webp";
        if (path.EndsWith(".jpg", StringComparison.Ordinal) || path.EndsWith(".jpeg", StringComparison.Ordinal)) return "image/jpeg";
        if (path.EndsWith(".gif", StringComparison.Ordinal)) return "image/gif";
        return "";
    }

    /// <summary>The manifest's icons: the declared one first (any size — its real size is unknown, so
    /// the browser scales it), then Mateu's defaults, which a browser falls back to and which
    /// guarantee the 192 and 512 px icons installability asks for. Their <c>src</c> is relative to
    /// the manifest. Each icon's members in order.</summary>
    internal static List<List<KeyValuePair<string, string>>> Icons(MobileManifest.Derived? source)
    {
        var icons = new List<List<KeyValuePair<string, string>>>();
        if (DeclaredIcon(source) is { } declared)
        {
            var icon = new List<KeyValuePair<string, string>> { new("src", declared), new("sizes", "any") };
            if (IconType(declared) is { Length: > 0 } type) icon.Add(new("type", type));
            icon.Add(new("purpose", "any"));
            icons.Add(icon);
        }
        icons.Add(Icon(Icon192, "192x192", "any"));
        icons.Add(Icon(Icon512, "512x512", "any"));
        icons.Add(Icon(IconMaskable, "512x512", "maskable"));
        return icons;
    }

    private static List<KeyValuePair<string, string>> Icon(string src, string sizes, string purpose) =>
        [new("src", src), new("sizes", sizes), new("type", "image/png"), new("purpose", purpose)];

    // ------------------------------------------------------------------------------------------
    // The page's head
    // ------------------------------------------------------------------------------------------

    /// <summary>Where a page finds the PWA's files.</summary>
    /// <param name="Manifest">The web app manifest's URL.</param>
    /// <param name="Worker">The service worker's URL (without query).</param>
    /// <param name="Register">The registration script's URL.</param>
    /// <param name="AppleTouchIcon">The icon iOS puts on the home screen.</param>
    /// <param name="Scope">The worker's scope.</param>
    /// <param name="Precache">Files the worker caches when installed besides the shell, may be empty.</param>
    internal sealed record Links(
        string Manifest, string Worker, string Register, string AppleTouchIcon, string Scope,
        IReadOnlyList<string> Precache)
    {
        /// <summary>The links of a UI served at <paramref name="baseUrl"/>.</summary>
        public static Links Served(string? baseUrl)
        {
            var dir = DirOf(baseUrl);
            return new Links(dir + Pwa.Manifest, dir + Pwa.Worker, dir + Pwa.Register, dir + Icon192,
                ScopeOf(baseUrl), []);
        }
    }

    /// <summary>A served page with the PWA's head: <paramref name="html"/> unchanged when it is
    /// switched off (<see cref="Enabled"/>). Java's <c>Pwa.served</c>, with the build id passed in
    /// (the .NET port keeps it on the <see cref="VersionSkew"/> service, not in a static).</summary>
    /// <param name="html">The page as served (markers filled, Oracle CDN re-pointed).</param>
    /// <param name="baseUrl">The UI's mount ("" for the root).</param>
    /// <param name="source">What the UI declares (theme colour, icon); null when unknown.</param>
    /// <param name="buildId">The build id (<c>X-Mateu-Build</c>), part of the worker's version.</param>
    /// <param name="configured"><c>MateuOptions.Pwa</c> (null: <c>MATEU_PWA_ENABLED</c>).</param>
    public static string Served(string html, string? baseUrl, MobileManifest.Derived? source, string? buildId,
        bool? configured = null) =>
        !Enabled(configured) ? html : WithHead(html, Links.Served(baseUrl), source, buildId);

    /// <summary><paramref name="html"/> with the manifest link, the theme colour, the
    /// apple-touch-icon and the worker's registration added to its <c>&lt;head&gt;</c>. The worker's
    /// URL carries its version — a hash of the page and of <paramref name="buildId"/>, so the next
    /// build installs a new worker that drops this one's cache — and the folders the page loads its
    /// own files from, which it may cache. A page that already has a manifest link is left as it is.</summary>
    public static string WithHead(string html, Links links, MobileManifest.Derived? source, string? buildId)
    {
        if (!html.Contains("</head>", StringComparison.Ordinal)
            || html.Contains("rel=\"manifest\"", StringComparison.Ordinal))
            return html;
        var query = new StringBuilder("?v=").Append(Version(html, buildId));
        foreach (var folder in StaticFolders(html)) query.Append("&s=").Append(UrlEncode(folder));
        foreach (var file in links.Precache) query.Append("&p=").Append(UrlEncode(file));
        var head = new StringBuilder();
        head.Append("<link rel=\"manifest\" href=\"").Append(Attr(links.Manifest))
            .Append("\" crossorigin=\"use-credentials\">");
        if (ThemeColor(source) is { } theme)
            head.Append("<meta name=\"theme-color\" content=\"").Append(Attr(theme)).Append("\">");
        var declared = DeclaredIcon(source);
        var touchIcon = declared is not null
                        && !declared.StartsWith("data:", StringComparison.Ordinal)
                        && IconType(declared) != "image/svg+xml"
            ? declared
            : links.AppleTouchIcon;
        head.Append("<link rel=\"apple-touch-icon\" href=\"").Append(Attr(touchIcon)).Append("\">");
        head.Append("<script src=\"").Append(Attr(links.Register))
            .Append("\" data-sw=\"").Append(Attr(links.Worker + query))
            .Append("\" data-scope=\"").Append(Attr(links.Scope))
            .Append("\" defer></script>");
        var at = html.IndexOf("</head>", StringComparison.Ordinal);
        return html[..at] + head + html[at..];
    }

    /// <summary>A short hash of the page and the build: the worker's version (16 lowercase hex).</summary>
    internal static string Version(string html, string? buildId)
    {
        using var sha = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
        sha.AppendData(Encoding.UTF8.GetBytes(html));
        sha.AppendData(Encoding.UTF8.GetBytes("\n" + buildId + "\n" + MateuVersion()));
        return Convert.ToHexString(sha.GetHashAndReset()).ToLowerInvariant()[..16];
    }

    /// <summary>Mateu's own version (the assembly's informational version), as in the build id.</summary>
    private static string MateuVersion()
    {
        var mateu = typeof(Pwa).Assembly;
        return mateu.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion
               ?? mateu.GetName().Version?.ToString() ?? "unknown";
    }

    private static readonly Regex ScriptSrc =
        new("<script\\b[^>]*?\\s(?:data-)?src\\s*=\\s*[\"']([^\"']+)[\"']", RegexOptions.IgnoreCase);
    private static readonly Regex Link = new("<link\\b[^>]*>", RegexOptions.IgnoreCase);
    private static readonly Regex LinkRel =
        new("\\srel\\s*=\\s*[\"'][^\"']*\\b(stylesheet|modulepreload|preload)\\b", RegexOptions.IgnoreCase);
    private static readonly Regex LinkHref = new("\\shref\\s*=\\s*[\"']([^\"']+)[\"']", RegexOptions.IgnoreCase);

    /// <summary>The folders a page loads its scripts and stylesheets from — <c>/assets/</c>,
    /// <c>/_redwood/</c>, <c>https://static.oracle.com/cdn/</c> — which the worker may cache whatever
    /// their request. Never a <c>/mateu/</c> folder, and only what scripts and stylesheets name, so no
    /// data endpoint can slip in. At most 8.</summary>
    internal static IReadOnlyList<string> StaticFolders(string html)
    {
        var urls = new List<string>();
        foreach (Match m in ScriptSrc.Matches(html)) urls.Add(m.Groups[1].Value);
        foreach (Match m in Link.Matches(html))
        {
            var tag = m.Value;
            if (!LinkRel.IsMatch(tag)) continue;
            var href = LinkHref.Match(tag);
            if (href.Success) urls.Add(href.Groups[1].Value);
        }
        var folders = new List<string>();
        foreach (var url in urls)
        {
            if (FolderOf(url.Trim()) is { } folder && !folders.Contains(folder)) folders.Add(folder);
            if (folders.Count >= 8) break;
        }
        return folders;
    }

    private static string? FolderOf(string url)
    {
        var lower = url.ToLowerInvariant();
        var origin = "";
        string path;
        if (lower.StartsWith("https://", StringComparison.Ordinal) || lower.StartsWith("http://", StringComparison.Ordinal)
            || lower.StartsWith("//", StringComparison.Ordinal))
        {
            var protocolRelative = lower.StartsWith("//", StringComparison.Ordinal);
            var from = protocolRelative ? 2 : url.IndexOf("//", StringComparison.Ordinal) + 2;
            var slash = url.IndexOf('/', from);
            if (slash < 0) return null;
            origin = (protocolRelative ? "https:" : "") + url[..slash];
            path = url[slash..];
        }
        else if (Scheme.IsMatch(lower) || lower.StartsWith('#'))
        {
            return null; // data:, blob:, javascript:…
        }
        else
        {
            path = url.StartsWith('/') ? url : "/" + (url.StartsWith("./", StringComparison.Ordinal) ? url[2..] : url);
        }
        path = PathOf(path);
        var second = path.IndexOf('/', 1);
        if (second < 0) return null; // a file at the root is no folder
        var segment = path[1..second];
        if (segment.Length == 0 || segment is "mateu" or ".." or ".") return null;
        return origin + "/" + segment + "/";
    }

    // ------------------------------------------------------------------------------------------
    // The files
    // ------------------------------------------------------------------------------------------

    /// <summary>A file of the PWA, ready to be written to the response (Java's <c>Pwa.Asset</c>).</summary>
    internal sealed record AssetFile(string ContentType, IReadOnlyDictionary<string, string> Headers, byte[] Body);

    /// <summary>A PWA file of the UI at <paramref name="baseUrl"/>, or null when <paramref name="file"/>
    /// is not one of them (a 404). Switched off (<see cref="Enabled"/>), the manifest and the
    /// registration script are 404 too, and the worker is the one that unregisters itself.</summary>
    /// <param name="file">The file name requested (the last segment of the URL).</param>
    /// <param name="baseUrl">The UI's mount ("" for the root).</param>
    /// <param name="source">What the UI declares, read only for the manifest.</param>
    /// <param name="configured"><c>MateuOptions.Pwa</c> (null: <c>MATEU_PWA_ENABLED</c>).</param>
    public static AssetFile? Asset(string? file, string? baseUrl, Func<MobileManifest.Derived?> source,
        bool? configured = null)
    {
        if (file is null) return null;
        var on = Enabled(configured);
        var scope = ScopeOf(baseUrl);
        const string Js = "text/javascript; charset=utf-8";
        return file switch
        {
            Manifest => on
                ? new AssetFile("application/manifest+json",
                    HeadersOf("application/manifest+json", "public, max-age=300", null),
                    Encoding.UTF8.GetBytes(ManifestJson(source(), scope, scope)))
                : null,
            Worker => new AssetFile(Js, HeadersOf(Js, "no-cache", scope), Resource(on ? Worker : WorkerOff)),
            Register => on ? new AssetFile(Js, HeadersOf(Js, "no-cache", null), Resource(Register)) : null,
            Icon192 or Icon512 or IconMaskable =>
                new AssetFile("image/png", HeadersOf("image/png", "public, max-age=86400", null), Resource(file)),
            _ => null,
        };
    }

    private static IReadOnlyDictionary<string, string> HeadersOf(string contentType, string cacheControl,
        string? workerScope)
    {
        var headers = new Dictionary<string, string>
        {
            ["Content-Type"] = contentType,
            ["Cache-Control"] = cacheControl,
            ["X-Content-Type-Options"] = "nosniff",
        };
        // the worker lives under /mateu/v3/pwa/ but controls the whole UI
        if (workerScope is not null) headers["Service-Worker-Allowed"] = workerScope;
        return headers;
    }

    /// <summary>The bytes of one of the files embedded in Mateu.Core (<see cref="Worker"/>, the icons…).</summary>
    public static byte[] Resource(string name)
    {
        using var stream = typeof(Pwa).Assembly.GetManifestResourceStream(ResourcePrefix + name)
                           ?? throw new InvalidOperationException("missing PWA resource " + name);
        using var buffer = new MemoryStream();
        stream.CopyTo(buffer);
        return buffer.ToArray();
    }

    private static string Attr(string? value) =>
        value is null ? "" : value.Replace("&", "&amp;").Replace("\"", "&quot;").Replace("<", "&lt;");

    /// <summary>Java's <c>URLEncoder.encode(value, UTF_8)</c>: A-Z a-z 0-9 <c>. - * _</c> kept, a space
    /// becomes <c>+</c>, every other UTF-8 byte <c>%XX</c> (uppercase hex). Not
    /// <see cref="Uri.EscapeDataString"/>, which differs on the space, <c>*</c> and <c>~</c>.</summary>
    internal static string UrlEncode(string value)
    {
        var sb = new StringBuilder();
        foreach (var b in Encoding.UTF8.GetBytes(value))
        {
            var c = (char)b;
            if (c is (>= 'a' and <= 'z') or (>= 'A' and <= 'Z') or (>= '0' and <= '9') or '.' or '-' or '*' or '_')
                sb.Append(c);
            else if (c == ' ')
                sb.Append('+');
            else
                sb.Append('%').Append(b.ToString("X2"));
        }
        return sb.ToString();
    }
}
