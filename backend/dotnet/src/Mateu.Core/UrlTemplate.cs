using System.Text.RegularExpressions;

namespace Mateu.Core;

/// <summary>
/// URL templates with their values percent-encoded by POSITION — the .NET twin of the Java
/// <c>TemplateInterpolator.interpolateUrl</c> (and of libs/mateu <c>interpolateUrl</c> on the browser
/// leg). A value is DATA and must never change the shape of the request: without encoding an id of
/// <c>1/../../admin?x=</c> turned <c>/people/${state.id}</c> into a request for <c>/admin</c>, and on
/// the proxied leg that is the SERVER fetching whatever the client asked for.
/// <list type="bullet">
/// <item>ORIGIN (scheme + authority, or a template starting with <c>${...}</c>): raw, but a
/// <c>${state.x}</c> there is refused;</item>
/// <item>PATH: encoded as a segment; a dot segment (<c>.</c>/<c>..</c>) is refused;</item>
/// <item>after a literal <c>?</c> or <c>#</c>: encoded as a query component.</item>
/// </list>
/// The encoding is RFC 3986 strict (<see cref="Uri.EscapeDataString(string)"/>), byte for byte the same as
/// the other backends and renderers.
/// </summary>
public static class UrlTemplate
{
    private static readonly Regex Placeholder = new(@"\$\{([^}]+)\}", RegexOptions.Compiled);
    private static readonly Regex AnyPlaceholder = new(@"\$\{[^}]*\}", RegexOptions.Compiled);

    /// <summary>The only environment variables a <c>${secret.X}</c> may fall back to.</summary>
    public const string SecretEnvPrefix = "MATEU_SECRET_";

    /// <summary>The environment variable <c>${secret.KEY}</c> falls back to: <c>MATEU_SECRET_KEY</c>
    /// (a key already carrying the prefix is used as is).</summary>
    public static string SecretEnvName(string key) =>
        key.StartsWith(SecretEnvPrefix, StringComparison.Ordinal) ? key : SecretEnvPrefix + key;

    /// <summary>All but the RFC 3986 unreserved characters percent-encoded (UTF-8, upper-case hex).</summary>
    public static string Encode(string? value) => string.IsNullOrEmpty(value) ? "" : Uri.EscapeDataString(value);

    /// <summary>Interpolate <paramref name="template"/>, resolving each <c>${expr}</c> with
    /// <paramref name="valueOf"/> and encoding it by position. Throws <see cref="ArgumentException"/>
    /// when a value is refused.</summary>
    public static string Interpolate(string? template, Func<string, string?> valueOf)
    {
        if (string.IsNullOrEmpty(template) || !template.Contains("${")) return template ?? "";
        var origin = OriginEnd(template);
        return Placeholder.Replace(template, m =>
        {
            var expr = m.Groups[1].Value.Trim();
            var value = valueOf(expr) ?? "";
            if (m.Index < origin)
            {
                if (expr.StartsWith("state.", StringComparison.Ordinal))
                    throw new ArgumentException("A client state value cannot choose the origin of a URL: " + template);
                return value;
            }
            var before = AnyPlaceholder.Replace(template[..m.Index], "");
            if (!before.Contains('?') && !before.Contains('#') && value is "." or "..")
                throw new ArgumentException("A dot segment is not a valid path value: " + value);
            return Encode(value);
        });
    }

    private static int OriginEnd(string t)
    {
        var scheme = t.IndexOf("://", StringComparison.Ordinal);
        var firstPlaceholder = t.IndexOf("${", StringComparison.Ordinal);
        if (scheme >= 0 && (firstPlaceholder < 0 || scheme < firstPlaceholder))
        {
            var i = scheme + 3;
            while (i < t.Length)
            {
                if (string.CompareOrdinal(t, i, "${", 0, 2) == 0)
                {
                    var close = t.IndexOf('}', i);
                    i = close < 0 ? t.Length : close + 1;
                    continue;
                }
                if (t[i] is '/' or '?' or '#') return i;
                i++;
            }
            return t.Length;
        }
        if (t.StartsWith("${", StringComparison.Ordinal))
        {
            var close = t.IndexOf('}');
            return close < 0 ? t.Length : close + 1;
        }
        return 0;
    }
}
