using System.IO.Compression;

namespace Mateu.Core;

/// <summary>
/// Serving a web renderer's page from this server — the .NET twin of Java's <c>IndexPage</c> +
/// <c>SpaFallback</c> + <c>StaticAssetCaching</c> (<c>io.mateu.core.infra</c>).
/// </summary>
/// <remarks>
/// A Java app serves its UI itself: the <c>mateu-vaadin</c> / <c>mateu-redwood</c> jar on the
/// classpath brings the renderer's page (<c>static/_index.html</c>) and assets, and the generated
/// controller answers the mount and its deep links with that page aimed at the mount. This port
/// answered the sync API only, so a first-time user had nothing to open in a browser. Given a
/// RENDERER — the <c>static/</c> folder of one of those jars, or the jar itself — the adapter serves
/// the same page the same way: the index at the mount and at every deep link under it (a GET that
/// accepts HTML and names no file), the assets at the origin root (where the renderer's page
/// references them), and nothing under <c>/mateu</c> (an API miss stays a 404, never the page).
/// The renderer is not packaged with the NuGet: point <c>MapMateu(ui: …)</c> / <c>MATEU_UI</c> at the
/// jar downloaded from Maven Central (<c>io.mateu:mateu-vaadin</c> or <c>mateu-redwood</c>, the
/// version of the wire you target) or at its extracted <c>static/</c> folder.
/// </remarks>
public static class UiPage
{
    /// <summary>The renderer the server serves, when not passed to <c>MapMateu(ui: …)</c>.</summary>
    public const string EnvVar = "MATEU_UI";

    /// <summary>Where the renderer's page and assets sit inside a renderer jar.</summary>
    public const string JarPrefix = "static/";

    public const string Index = "_index.html";

    public const string TitleMarker = "AQUIELTITULODELAPAGINA";
    public const string UiFrom = "<!-- AQUIUI -->";
    public const string UiTo = "<!-- HASTAAQUIUI -->";

    /// <summary>Java's <c>IndexPage.DEFERRED_BOOT</c>, byte for byte: boots a page that parks its
    /// scripts as <c>type="text/mateu-deferred"</c> (the Redwood / Visual Builder page), in order,
    /// awaiting each, and explains itself instead of staying blank when one cannot be loaded. A
    /// no-op on the Vite-built Vaadin page, which has no deferred scripts.</summary>
    public const string DeferredBoot =
        "<script>(function(){var all=document.getElementsByTagName('script'),d=[];"
        + "for(var j=0;j<all.length;j++){if(all[j].type==='text/mateu-deferred')d.push(all[j]);}"
        + "if(!d.length)return;"
        + "function fail(u){console.log('mateu: deferred boot failed',u);"
        + "if(document.getElementById('mateu-boot-failed'))return;"
        + "var f=document.createElement('div');f.id='mateu-boot-failed';f.setAttribute('role','alert');"
        + "f.setAttribute('style','font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;max-width:40rem;margin:15vh auto;padding:1.5rem;line-height:1.5;color:#1a1a1a;background:#fff;border:1px solid #ddd;border-radius:8px;');"
        + "f.innerHTML='<h1 style=\"font-size:1.4rem;margin:0 0 .5rem\">The application could not start</h1>'"
        + "+'<p>A script it needs could not be loaded:</p><p><code style=\"word-break:break-all\"></code></p>'"
        + "+'<p>Check your network connection, or whether a proxy or a content security policy blocks it.</p>'"
        + "+'<p><a href=\"\">Try again</a></p>';"
        + "f.querySelector('code').textContent=u;"
        + "f.querySelector('a').addEventListener('click',function(e){e.preventDefault();location.reload();});"
        + "document.body.appendChild(f);}"
        + "var i=0;(function n(){if(i>=d.length)return;var o=d[i++],s=document.createElement('script');"
        + "for(var k=0;k<o.attributes.length;k++){var a=o.attributes[k];"
        + "if(a.name==='type'||a.name==='data-src')continue;s.setAttribute(a.name,a.value);}"
        + "var u=o.getAttribute('data-src');"
        + "if(u){s.onload=n;s.onerror=function(){fail(u);};s.src=u;}else{s.text=o.textContent;}"
        + "o.parentNode.replaceChild(s,o);if(!u)n();})();})();</script>";

    /// <summary>Folders whose files the browser must revalidate on every load (their names carry no
    /// hash — Java's StaticAssetCaching.REVALIDATE_FOLDERS); a <c>/version_&lt;ts&gt;/</c> path is immutable.</summary>
    public static readonly string[] RevalidateFolders = ["assets", "js", "myassets", "_redwood"];
    public const string ImmutableCacheControl = "max-age=31536000, public, immutable";
    public const string RevalidateCacheControl = "no-cache";

    private static readonly Dictionary<string, string> ContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".js"] = "text/javascript", [".mjs"] = "text/javascript", [".css"] = "text/css",
        [".json"] = "application/json", [".map"] = "application/json", [".svg"] = "image/svg+xml",
        [".woff2"] = "font/woff2", [".woff"] = "font/woff", [".ttf"] = "font/ttf",
        [".html"] = "text/html; charset=utf-8", [".png"] = "image/png", [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg", [".gif"] = "image/gif", [".ico"] = "image/x-icon", [".txt"] = "text/plain",
        [".webp"] = "image/webp", [".wasm"] = "application/wasm",
    };

    private static string Attr(string value) => value.Replace("&", "&amp;").Replace("\"", "&quot;");

    /// <summary>Java's <c>IndexPage.mountUi</c>: the <c>&lt;!-- AQUIUI --&gt;…&lt;!-- HASTAAQUIUI --&gt;</c>
    /// region becomes a <c>&lt;mateu-ui&gt;</c> root aimed at the mount, followed by the deferred-boot
    /// replayer. A page without the markers is returned unchanged.</summary>
    public static string MountUi(string html, string baseUrl, bool debug = false)
    {
        var from = html.IndexOf(UiFrom, StringComparison.Ordinal);
        var to = html.IndexOf(UiTo, StringComparison.Ordinal);
        if (from < 0 || to < from) return html;
        var root = "<mateu-ui baseUrl=\"" + Attr(baseUrl) + "\" pathPrefix=\"" + Attr(baseUrl) + "\""
                   + (debug ? " debug=\"true\"" : "") + " style=\"width:100%;height:100vh;\"></mateu-ui>";
        return html[..from] + root + DeferredBoot + html[to..];
    }

    /// <summary>The renderer's page aimed at <paramref name="baseUrl"/> (the mount, "" for the root) and titled.</summary>
    public static string RenderIndex(string template, string baseUrl, string title, bool debug = false) =>
        MountUi(template.Replace(TitleMarker, title), baseUrl, debug);

    /// <summary>Java's <c>SpaFallback.candidate</c>: a deep link the page may answer — not the root
    /// itself, no file extension, and never the API (<c>/mateu/…</c>).</summary>
    public static bool SpaCandidate(string? path) =>
        !string.IsNullOrEmpty(path) && path != "/" && !path.Contains('.') && !path.StartsWith("/mateu", StringComparison.Ordinal);

    /// <summary>Java's <c>SpaFallback.acceptsHtml</c>: a browser navigation (or no preference) — a data
    /// fetch asking for JSON (or <c>*/*</c>) is never answered with the page.</summary>
    public static bool AcceptsHtml(string? accept) =>
        string.IsNullOrWhiteSpace(accept) || accept.Contains("text/html", StringComparison.Ordinal);

    /// <summary>Whether <paramref name="path"/> is the mount or a deep link under it ("" = the root).</summary>
    public static bool UnderMount(string path, string baseUrl) =>
        baseUrl.Length == 0 || path == baseUrl || path.StartsWith(baseUrl + "/", StringComparison.Ordinal);

    /// <summary>Java's <c>StaticAssetCaching.cacheControlFor</c>.</summary>
    public static string? CacheControlFor(string path)
    {
        if (!path.StartsWith('/')) return null;
        if (path.StartsWith("/version_", StringComparison.Ordinal) && path.IndexOf('/', 1) > 0) return ImmutableCacheControl;
        foreach (var folder in RevalidateFolders)
            if (path.StartsWith("/" + folder + "/", StringComparison.Ordinal)) return RevalidateCacheControl;
        return null;
    }

    public static string ContentTypeOf(string path) =>
        ContentTypes.TryGetValue(Path.GetExtension(path), out var type) ? type : "application/octet-stream";

    /// <summary>The renderer to serve: <paramref name="ui"/> when given, else <c>MATEU_UI</c>, else none (API only).</summary>
    public static RendererFiles? ConfiguredRenderer(string? ui)
    {
        var location = ui ?? Environment.GetEnvironmentVariable(EnvVar);
        return string.IsNullOrWhiteSpace(location) ? null : RendererFiles.At(location);
    }
}

/// <summary>A web renderer's files: a directory holding <c>_index.html</c> and its assets (a jar's
/// extracted <c>static/</c> folder, a renderer's <c>dist/</c>), or the jar/zip itself, read in place
/// (only its <c>static/</c> entries: never META-INF, never classes).</summary>
public sealed class RendererFiles
{
    public string Location { get; }
    public bool IsArchive { get; }

    private RendererFiles(string location, bool isArchive)
    {
        Location = location;
        IsArchive = isArchive;
    }

    public static RendererFiles At(string location)
    {
        var full = Path.GetFullPath(location);
        if (!File.Exists(full) && !Directory.Exists(full))
            throw new FileNotFoundException($"Mateu UI renderer not found at {full}");
        var files = new RendererFiles(full, File.Exists(full));
        if (files.Read(UiPage.Index) is null)
            throw new FileNotFoundException(
                $"{full} is not a Mateu web renderer: no {UiPage.Index} (expected the static/ folder of "
                + "io.mateu:mateu-vaadin or mateu-redwood, or the jar itself)");
        return files;
    }

    /// <summary>The bytes of <paramref name="relative"/> (<c>assets/mateu-vaadin.js</c>), or null when
    /// it is not a file of this renderer. Never escapes the renderer's root.</summary>
    public byte[]? Read(string relative)
    {
        relative = relative.TrimStart('/');
        if (relative.Length == 0 || relative.Split('/').Contains("..")) return null;
        if (IsArchive)
        {
            try
            {
                using var jar = ZipFile.OpenRead(Location);
                var entry = jar.GetEntry(UiPage.JarPrefix + relative);
                if (entry is null || entry.FullName.EndsWith('/')) return null;
                using var stream = entry.Open();
                using var buffer = new MemoryStream();
                stream.CopyTo(buffer);
                return buffer.ToArray();
            }
            catch (InvalidDataException)
            {
                return null;
            }
        }
        var file = Path.GetFullPath(Path.Combine(Location, relative));
        if (!file.StartsWith(Location + Path.DirectorySeparatorChar, StringComparison.Ordinal)) return null;
        return File.Exists(file) ? File.ReadAllBytes(file) : null;
    }

    public string IndexTemplate() =>
        System.Text.Encoding.UTF8.GetString(Read(UiPage.Index)
            ?? throw new FileNotFoundException($"{Location} has no {UiPage.Index}"));
}
