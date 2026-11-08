using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

namespace Mateu.Core.Bundle;

/// <summary>
/// Writes the static bundle to disk — the .NET twin of the Maven plugin's <c>BundleWriter</c> and
/// <c>MobileManifestFile</c>: the same files at the same paths, so a bundle exported from this port
/// is served (and read by the renderers, the mobile app and the desktop hub) exactly like Java's:
/// <c>manifest.json</c>; the renderer's static app (everything a renderer jar ships under
/// <c>static/</c> but its <c>_index.html</c> template); <c>index.html</c> booting
/// <c>&lt;mateu-ui bundleUrl="&lt;base&gt;/manifest.json"&gt;</c>; the installable app (<c>pwa/</c>,
/// <c>mateu-sw.js</c>); <c>mateu/v3/manifest</c> (the mobile UI manifest + <c>"bundle"</c>); and the
/// <c>_redirects</c> SPA fallback.
/// </summary>
internal static class BundleWriter
{
    public const string Worker = "mateu-sw.js";
    public const string PwaDir = "pwa/";

    /// <summary>The path the bundle is served under (Java's <c>BundleWriter.basePathOf</c>).</summary>
    public static string BasePathOf(string? baseUrl)
    {
        if (string.IsNullOrWhiteSpace(baseUrl)) return "";
        var path = baseUrl.Trim();
        if (!path.StartsWith('/'))
            path = Uri.TryCreate(path, UriKind.Absolute, out var uri) ? uri.AbsolutePath : "";
        path = path.TrimEnd('/');
        return path.Length == 0 || path.StartsWith('/') ? path : "/" + path;
    }

    /// <summary>The renderer's <c>_index.html</c> aimed at the bundle (Java's <c>stampIndex</c>).</summary>
    public static string StampIndex(string html, string? baseUrl, string? pageTitle)
    {
        html = html.Replace(UiPage.TitleMarker, string.IsNullOrEmpty(pageTitle) ? "Mateu" : pageTitle);
        var b = baseUrl ?? "";
        var ui = $"<mateu-ui baseUrl=\"{b}\" bundleUrl=\"{b}/manifest.json\" style=\"width:100%;height:100vh;\"></mateu-ui>";
        html = html.Replace(UiPage.FaviconMarker, UiPage.DefaultFavicon);
        var start = html.IndexOf(UiPage.UiFrom, StringComparison.Ordinal);
        var end = html.IndexOf(UiPage.UiTo, StringComparison.Ordinal);
        if (start >= 0 && end >= start) html = html[..start] + ui + UiPage.DeferredBoot + html[end..];
        var mirror = UiPage.ResolveOracleCdn(null, out _);
        return UiPage.RewriteOracleCdn(UiPage.WithoutMarkers(html), mirror);
    }

    /// <summary>Everything the renderer ships but its <c>_index.html</c> template.</summary>
    public static void CopyStaticApp(RendererFiles renderer, string outDir)
    {
        var root = Path.GetFullPath(outDir) + Path.DirectorySeparatorChar;
        if (renderer.IsArchive)
        {
            using var jar = ZipFile.OpenRead(renderer.Location);
            foreach (var entry in jar.Entries)
            {
                var name = entry.FullName;
                if (!name.StartsWith(UiPage.JarPrefix, StringComparison.Ordinal) || name.EndsWith('/')) continue;
                var relative = name[UiPage.JarPrefix.Length..];
                if (relative == UiPage.Index) continue;
                var target = Path.GetFullPath(Path.Combine(outDir, relative));
                if (!target.StartsWith(root, StringComparison.Ordinal)) continue; // zip-slip
                Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                entry.ExtractToFile(target, overwrite: true);
            }
            return;
        }
        foreach (var file in Directory.EnumerateFiles(renderer.Location, "*", SearchOption.AllDirectories))
        {
            var relative = Path.GetRelativePath(renderer.Location, file);
            if (relative == UiPage.Index) continue;
            var target = Path.Combine(outDir, relative);
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.Copy(file, target, overwrite: true);
        }
    }

    /// <summary>The installable app's files; returns <paramref name="index"/> with its head. Off: only
    /// the worker that unregisters itself, and the page as it was.</summary>
    public static string WritePwa(string outDir, string index, string? baseUrl, string manifestJson, bool enabled,
        MobileManifest.Derived? source)
    {
        if (!enabled)
        {
            File.WriteAllBytes(Path.Combine(outDir, Worker), Pwa.Resource(Pwa.WorkerOff));
            return index;
        }
        var b = BasePathOf(baseUrl);
        var scope = b + "/";
        var dir = Path.Combine(outDir, PwaDir);
        Directory.CreateDirectory(dir);
        File.WriteAllText(Path.Combine(dir, Pwa.Manifest), Pwa.ManifestJson(source, scope, scope));
        foreach (var name in new[] { Pwa.Register, Pwa.Icon192, Pwa.Icon512, Pwa.IconMaskable })
            File.WriteAllBytes(Path.Combine(dir, name), Pwa.Resource(name));
        File.WriteAllBytes(Path.Combine(outDir, Worker), Pwa.Resource(Pwa.Worker));
        var links = new Pwa.Links(b + "/" + PwaDir + Pwa.Manifest, b + "/" + Worker, b + "/" + PwaDir + Pwa.Register,
            b + "/" + PwaDir + Pwa.Icon192, scope, [b + "/manifest.json"]);
        var version = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(manifestJson))).ToLowerInvariant()[..16];
        return Pwa.WithHead(index, links, source, version);
    }

    /// <summary>The UI manifest of the bundled app (what a server answers at <c>/mateu/v3/manifest</c>),
    /// plus <c>"bundle": "manifest.json"</c>.</summary>
    public static string MobileManifestJson(Type? appType, string? pageTitle)
    {
        var manifest = JsonNode.Parse(MobileManifest.Json(appType))!.AsObject();
        if (appType is null && !string.IsNullOrWhiteSpace(pageTitle))
        {
            manifest["name"] = pageTitle;
            manifest["shortName"] = pageTitle;
        }
        manifest["bundle"] = "manifest.json";
        return manifest.ToJsonString(BundleJson.Wire);
    }

    /// <summary>Writes the bundle into <paramref name="outDir"/> (created) — a self-contained static site.</summary>
    public static void Write(string outDir, BundleManifest manifest, RendererFiles renderer, string? baseUrl,
        string? pageTitle, bool pwa, Type? appType)
    {
        Directory.CreateDirectory(outDir);
        var manifestJson = manifest.ToJson();
        File.WriteAllText(Path.Combine(outDir, "manifest.json"), manifestJson);
        CopyStaticApp(renderer, outDir);
        var index = StampIndex(renderer.IndexTemplate(), baseUrl, pageTitle);
        index = WritePwa(outDir, index, baseUrl, manifestJson, pwa, MobileManifest.Derive(appType));
        File.WriteAllText(Path.Combine(outDir, "index.html"), index);
        var mobile = Path.Combine(outDir, MobileManifest.Path.TrimStart('/'));
        Directory.CreateDirectory(Path.GetDirectoryName(mobile)!);
        File.WriteAllText(mobile, MobileManifestJson(appType, pageTitle));
        File.WriteAllText(Path.Combine(outDir, "_redirects"), "/*    /index.html    200\n");
    }
}
