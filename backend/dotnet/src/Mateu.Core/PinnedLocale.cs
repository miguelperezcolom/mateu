using System.Text.RegularExpressions;

namespace Mateu.Core;

/// <summary>The app's pinned UI language (Java: <c>mateu.locale</c>, <c>io.mateu.core.infra.ConfiguredLocale</c>):
/// <c>MateuOptions.Locale</c>, else the <c>MATEU_LOCALE</c> environment variable — a BCP 47 tag such
/// as <c>es</c> or <c>pt-BR</c>. When it is set, every request gets that language (the app shell's
/// <c>locale</c>, so <c>&lt;html lang&gt;</c>, the client chrome and money formatting, and what
/// <c>${i18n.…}</c> resolves for) instead of the browser's <c>Accept-Language</c>. An app's own
/// <see cref="Mateu.Uidl.ITranslator.Locale"/> still wins over it.</summary>
internal static class PinnedLocale
{
    public const string EnvVar = "MATEU_LOCALE";

    // a plain Regex, not [GeneratedRegex]: the generator emits code no test walks through
    private static readonly Regex TagRegex = new("^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$", RegexOptions.Compiled);

    private static Regex Tag() => TagRegex;

    /// <summary>The pinned tag, normalised (<c>pt_br</c> → <c>pt-BR</c>): <paramref name="configured"/>
    /// when not blank, else <c>MATEU_LOCALE</c>; null when neither is set or the value is not a language
    /// tag, in which case <paramref name="rejected"/> carries the warning to log.</summary>
    public static string? Resolve(string? configured, out string? rejected)
    {
        rejected = null;
        var value = string.IsNullOrWhiteSpace(configured) ? Environment.GetEnvironmentVariable(EnvVar) : configured;
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim().Replace('_', '-');
        if (!Tag().IsMatch(trimmed) || trimmed.Split('-')[0].Length == 4
            || trimmed.Split('-')[0].Equals("und", StringComparison.OrdinalIgnoreCase))
        {
            rejected = "Ignoring MateuOptions.Locale / " + EnvVar + " '" + MateuLogging.Safe(value.Trim())
                       + "': not a language tag (expected e.g. es, en-GB, pt-BR).";
            return null;
        }
        return Normalize(trimmed);
    }

    /// <summary>The UI language of a request: the pinned one when set, else the first tag of its
    /// <c>Accept-Language</c> header.</summary>
    public static string? Of(string? pinned, string? acceptLanguage) =>
        pinned ?? TranslationRegistry.AcceptLanguage(acceptLanguage);

    /// <summary>BCP 47 casing, as Java's <c>Locale.toLanguageTag()</c>: language lower case, a
    /// 4-letter script title case, a 2-letter region upper case, the rest lower case.</summary>
    private static string Normalize(string tag)
    {
        var parts = tag.Split('-');
        for (var i = 0; i < parts.Length; i++)
        {
            var p = parts[i];
            parts[i] = i == 0 ? p.ToLowerInvariant()
                : p.Length == 4 && p.All(char.IsLetter) ? char.ToUpperInvariant(p[0]) + p[1..].ToLowerInvariant()
                : p.Length == 2 && p.All(char.IsLetter) ? p.ToUpperInvariant()
                : p.ToLowerInvariant();
        }
        return string.Join('-', parts);
    }
}
