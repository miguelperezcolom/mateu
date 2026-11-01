using System.Collections;
using System.Text.Json;
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
internal static class UrlTemplate
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
    /// <remarks><c>${encodeURIComponent(x)}</c> — how a value had to be written before Mateu encoded
    /// it — is encoded ONCE: <paramref name="valueOf"/> answers it already encoded (<see cref="ValueOf"/>
    /// does), so it is not encoded again (that sent <c>a%252Cb</c> for <c>a,b</c>).</remarks>
    public static string Interpolate(string? template, Func<string, string?> valueOf)
    {
        if (string.IsNullOrEmpty(template) || !template.Contains("${")) return template ?? "";
        var origin = OriginEnd(template);
        return Placeholder.Replace(template, m =>
        {
            var expr = m.Groups[1].Value.Trim();
            var inner = EncodeCallArgument(expr);
            var value = valueOf(expr) ?? "";
            if (m.Index < origin)
            {
                if ((inner ?? expr).Trim().StartsWith("state.", StringComparison.Ordinal))
                    throw new ArgumentException("A client state value cannot choose the origin of a URL: " + template);
                return value;
            }
            var before = AnyPlaceholder.Replace(template[..m.Index], "");
            if (!before.Contains('?') && !before.Contains('#') && value is "." or "..")
                throw new ArgumentException("A dot segment is not a valid path value: " + value);
            return inner is not null ? value : Encode(value);
        });
    }

    // ── the expressions a source template may use beside a plain path ──────────────────────────

    private const string EncodeCall = "encodeURIComponent";

    /// <summary>The text a <c>${...}</c> expression resolves to (unknown → empty): <c>state.a</c> /
    /// <c>state.a.b</c>, <c>secret.KEY</c>, a literal, <c>a ?? b</c>, or <c>encodeURIComponent(x)</c>
    /// (already encoded). A MONEY value (<c>{value, currency, locale}</c>) is its amount; its currency
    /// is <c>${state.x.currency}</c>. Java's TemplateInterpolator, Python's resolve_expression.</summary>
    public static string ValueOf(string expr, IReadOnlyDictionary<string, object?>? state, Func<string, string?> secrets) =>
        Text(Resolve(expr, state, secrets));

    private static object? Resolve(string rawExpr, IReadOnlyDictionary<string, object?>? state, Func<string, string?> secrets)
    {
        var expr = rawExpr.Trim();
        // a plain path keeps its old meaning first: a FLAT key "a.b" in the state wins over a walk
        if (PlainStatePath.IsMatch(expr)) return StatePath(state, expr[6..]);
        var inner = EncodeCallArgument(expr);
        if (inner is not null) return Encode(JsText(Resolve(inner, state, secrets)));
        // anything else is evaluated with the browser's meaning (ProxyExpression, Java's twin) so a
        // source flipped to proxy: true keeps sending what it sent from the browser
        try
        {
            var value = ProxyExpression.Evaluate(expr, state, secrets);
            return ReferenceEquals(value, ProxyExpression.Undefined) ? null : value;
        }
        catch (ProxyExpression.UnsupportedException e)
        {
            WarnUnsupported(expr, e.Message);
            return null;
        }
        catch (Exception)
        {
            return null; // e.g. a member of a missing value: the placeholder renders empty, as before
        }
    }

    private static readonly Regex PlainStatePath =
        new(@"^state\.[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$", RegexOptions.Compiled);

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, bool> Warned = new();

    private static void WarnUnsupported(string expr, string why)
    {
        if (Warned.Count < 1000 && Warned.TryAdd(expr, true))
            Microsoft.Extensions.Logging.LoggerExtensions.LogWarning(MateuLogging.For("Mateu.UrlTemplate"),
                "A source template the server cannot evaluate renders empty: ${{{Expression}}} ({Why})",
                MateuLogging.Safe(expr), MateuLogging.Safe(why));
    }

    /// <summary><c>a.b.c</c> in the state: a flat key first (as always), else a walk through nested objects.</summary>
    private static object? StatePath(IReadOnlyDictionary<string, object?>? state, string path)
    {
        if (state is null) return null;
        if (state.TryGetValue(path, out var flat)) return flat;
        object? current = null;
        var first = true;
        foreach (var raw in path.Split('.'))
        {
            var part = raw.Trim();
            current = first ? (state.TryGetValue(part, out var v) ? v : null) : Child(current, part);
            first = false;
            if (current is null) return null;
        }
        return current;
    }

    private static object? Child(object? parent, string key) => parent switch
    {
        JsonElement { ValueKind: JsonValueKind.Object } el => el.TryGetProperty(key, out var child) ? child : null,
        IDictionary<string, object?> map => map.TryGetValue(key, out var child) ? child : null,
        _ => null,
    };

    /// <summary>A money value: what a <c>dataType: money</c> field holds (<c>{value, currency, …}</c>).</summary>
    private static bool IsMoney(object? v) => v switch
    {
        JsonElement { ValueKind: JsonValueKind.Object } el => el.TryGetProperty("value", out _) && el.TryGetProperty("currency", out _),
        IDictionary<string, object?> map => map.ContainsKey("value") && map.ContainsKey("currency"),
        _ => false,
    };

    /// <summary>A resolved value as the text that lands in the template (Java's text, Python's template_text).</summary>
    private static string Text(object? v) => v switch
    {
        _ when IsMoney(v) => Text(Child(v, "value")),
        JsonElement { ValueKind: JsonValueKind.Number } el => el.GetRawText(),
        // as JavaScript's String(v), the browser leg: a list is `a,b`, 3.0 is `3`, an object is
        // `[object Object]` — every leg converts a value the same way
        _ => ProxyExpression.Text(v),
    };

    /// <summary>A value as JavaScript's <c>String(v)</c> converts it — what <c>encodeURIComponent(v)</c>
    /// encodes in the browser: a list as <c>a,b</c> (a multi-select's values), a money value as its amount.</summary>
    private static string JsText(object? v) => v switch
    {
        JsonElement { ValueKind: JsonValueKind.Array } el => string.Join(",", el.EnumerateArray().Select(e => JsText(e))),
        string => Text(v),
        IEnumerable items and not IDictionary<string, object?> => string.Join(",", items.Cast<object?>().Select(JsText)),
        _ => Text(v),
    };

    /// <summary>The argument of an expression that is exactly ONE <c>encodeURIComponent(...)</c> call,
    /// else null (<c>encodeURIComponent(a) + encodeURIComponent(b)</c> is not one).</summary>
    public static string? EncodeCallArgument(string expr)
    {
        var e = expr.Trim();
        if (!e.StartsWith(EncodeCall, StringComparison.Ordinal)) return null;
        var rest = e[EncodeCall.Length..].Trim();
        if (!rest.StartsWith('(') || !rest.EndsWith(')')) return null;
        var depth = 0;
        var quote = '\0';
        for (var i = 0; i < rest.Length; i++)
        {
            var c = rest[i];
            if (quote != '\0')
            {
                if (c == '\\') i++;
                else if (c == quote) quote = '\0';
                continue;
            }
            if (c is '\'' or '"' or '`') quote = c;
            else if (c == '(') depth++;
            else if (c == ')')
            {
                depth--;
                if (depth == 0 && i != rest.Length - 1) return null; // the call closes before the end
            }
        }
        return depth == 0 ? rest[1..^1] : null;
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
