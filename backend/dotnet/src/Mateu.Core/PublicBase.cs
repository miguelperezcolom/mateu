using System.Text.RegularExpressions;

namespace Mateu.Core;

/// <summary>
/// The PUBLIC base path of the app — the .NET twin of Java's <c>io.mateu.core.infra.PublicBase</c>:
/// the path in front of everything it serves as the BROWSER sees it, <c>""</c> at the root of a
/// host, <c>"/crm"</c> under <c>app.UsePathBase("/crm")</c> or behind a reverse proxy that serves
/// the app at <c>/crm/</c> and strips the prefix.
/// </summary>
/// <remarks>
/// It is the explicit <c>MateuOptions.PublicBasePath</c> (env <c>MATEU_PUBLIC_BASE_PATH</c>, Java's
/// <c>mateu.public-base-path</c>) followed by the request's <c>PathBase</c> — which ASP.NET fills
/// from <c>UsePathBase</c> and, once the app opts in with
/// <c>UseForwardedHeaders(ForwardedHeaders.XForwardedPrefix)</c>, from <c>X-Forwarded-Prefix</c>:
/// trusting that header is the platform's opt-in, as Java's <c>mateu.trust-forwarded-prefix</c>.
/// Only the served page needs it (its assets, its <c>&lt;mateu-ui baseUrl&gt;</c>, the PWA links);
/// everything else answers the path it receives. A value that is not a plain path is ignored.
/// </remarks>
public static class PublicBase
{
    /// <summary>The explicit prefix, when not set in <c>MateuOptions.PublicBasePath</c>.</summary>
    public const string EnvVar = "MATEU_PUBLIC_BASE_PATH";

    private static readonly Regex PlainPath = new("^(/[A-Za-z0-9._~-]+)+$");

    /// <summary><paramref name="value"/> as a base path (<c>""</c> or <c>"/a/b"</c>), <c>""</c> when
    /// blank, <c>"/"</c> or not a plain path.</summary>
    public static string Normalize(string? value)
    {
        if (value is null) return "";
        var v = value.Trim();
        var comma = v.IndexOf(',');
        if (comma >= 0) v = v[..comma].Trim();
        v = v.TrimEnd('/');
        if (v.Length == 0) return "";
        if (!v.StartsWith('/')) v = "/" + v;
        return PlainPath.IsMatch(v) ? v : "";
    }

    /// <summary>The public base of a request: the configured prefix (else <see cref="EnvVar"/>)
    /// followed by its <paramref name="pathBase"/>.</summary>
    public static string Of(string? pathBase, string? configured = null) =>
        Normalize(string.IsNullOrWhiteSpace(configured) ? Environment.GetEnvironmentVariable(EnvVar) : configured)
        + Normalize(pathBase);

    private static readonly Regex RootRelativeAttr =
        new("(\\s(?:src|href|data-src)\\s*=\\s*)([\"'])/(?!/)", RegexOptions.IgnoreCase);

    private static readonly Regex VbBaseUrl = new("(\\bBASE_URL\\s*:\\s*)([\"'])/(?!/)");

    /// <summary><paramref name="html"/> with its root-relative URLs (<c>src</c>, <c>href</c>,
    /// <c>data-src</c>, a Redwood page's <c>&lt;base href="/"&gt;</c> and <c>BASE_URL</c>) under
    /// <paramref name="publicBase"/>; a no-op for <c>""</c>.</summary>
    public static string Rewrite(string html, string? publicBase)
    {
        var b = Normalize(publicBase);
        if (b.Length == 0) return html;
        var replacement = "$1$2" + b.Replace("$", "$$") + "/";
        html = RootRelativeAttr.Replace(html, replacement);
        return VbBaseUrl.Replace(html, replacement);
    }
}
