using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// The app's translation catalogue (the C# mirror of Java's TranslationRegistry). Two producers, one
/// catalogue: <see cref="ITranslationsSupplier"/> implementers of the scanned assemblies are the CODE
/// half, the <c>type: Translations</c> files under the specs directory (and the
/// <c>translations/&lt;locale&gt;.yaml</c> convention, where the file name is the locale) the AUTHORED
/// half, merged on top key by key — authored wins.
///
/// <para>Texts reference a message as <c>${i18n.orders.title}</c>, resolved on the SERVER per request
/// for the request's locale: exact (<c>es-ES</c>) → language (<c>es</c>) → fallback
/// (MATEU_I18N_FALLBACK, default <c>en</c>) → the key itself, with ONE warning per (locale, key).</para>
/// </summary>
public sealed class TranslationRegistry
{
    /// <summary>The <c>${i18n.key}</c> expression, anywhere inside a text.</summary>
    public static readonly Regex Expression = new(@"\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.\-]*)\s*\}", RegexOptions.Compiled);

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    private readonly Func<IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>>> _load;
    private IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>>? _catalogue;
    private readonly ConcurrentDictionary<string, bool> _warned = new();

    /// <param name="registry">Where the code suppliers are discovered (null = none).</param>
    /// <param name="dir">The specs directory (default: MATEU_SPECS_DIR, else specs/ui).</param>
    public TranslationRegistry(MateuRegistry? registry = null, string? dir = null)
    {
        var specs = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR") ?? Path.Combine("specs", "ui");
        _load = () => Merge(FromSuppliers(registry?.ScannedTypes ?? []), AuthoredFrom(specs));
    }

    /// <summary>A registry over fixed catalogues (tests, hosts that build them themselves).</summary>
    public TranslationRegistry(IEnumerable<Translations> translations) =>
        _load = () => Merge(translations, []);

    /// <summary>locale (lower-case BCP 47) → key → text, loaded once.</summary>
    public IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>> Catalogue => _catalogue ??= _load();

    public bool HasTranslations => Catalogue.Count > 0;

    private static IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>> Merge(
        IEnumerable<Translations> code, IEnumerable<Translations> authored)
    {
        var merged = new SortedDictionary<string, Dictionary<string, string>>(StringComparer.Ordinal);
        foreach (var t in code.Concat(authored))
        {
            var locale = Normalize(t.Locale);
            if (locale.Length == 0) continue;
            if (!merged.TryGetValue(locale, out var messages)) merged[locale] = messages = new();
            foreach (var (k, v) in Flatten(t.Messages)) messages[k] = v;
        }
        if (merged.Count > 0)
            MateuLogging.For("Mateu.I18n").LogInformation("Translations: {Count} locale(s) {Locales} (fallback '{Fallback}')",
                merged.Count, string.Join(", ", merged.Keys), FallbackLocale());
        return merged.ToDictionary(kv => kv.Key, kv => (IReadOnlyDictionary<string, string>)kv.Value);
    }

    private static IEnumerable<Translations> FromSuppliers(IEnumerable<Type> scanned)
    {
        var out_ = new List<Translations>();
        foreach (var type in scanned.Where(t => typeof(ITranslationsSupplier).IsAssignableFrom(t)
                                                && t is { IsAbstract: false, IsInterface: false }
                                                && t.GetConstructor(Type.EmptyTypes) is not null))
        {
            try
            {
                out_.AddRange(((ITranslationsSupplier)Activator.CreateInstance(type)!).Translations() ?? []);
            }
            catch (Exception e)
            {
                MateuLogging.For("Mateu.I18n").LogWarning(e, "Translations supplier {Type} skipped: {Error}", type.FullName, e.Message);
            }
        }
        return out_;
    }

    /// <summary>The authored half: every <c>type: Translations</c> file under <paramref name="dir"/>,
    /// plus the files under <c>translations/</c> (the locale is the file name when not declared).</summary>
    public static List<Translations> AuthoredFrom(string dir)
    {
        var found = new List<Translations>();
        if (!Directory.Exists(dir)) return found;
        foreach (var file in Directory.EnumerateFiles(dir, "*.*", SearchOption.AllDirectories)
                     .Where(f => f.EndsWith(".yaml") || f.EndsWith(".yml")).Order(StringComparer.Ordinal))
        {
            try
            {
                var relative = Path.GetRelativePath(dir, file).Replace('\\', '/');
                if (Parse(Yaml.Deserialize<object?>(File.ReadAllText(file)), relative) is { } t) found.Add(t);
            }
            catch (Exception e)
            {
                MateuLogging.For("Mateu.I18n").LogWarning(e, "Translations {File} skipped: {Error}", file, e.Message);
            }
        }
        return found;
    }

    /// <summary>A parsed file as one locale's catalogue, or null when it is not a translations file.</summary>
    /// <param name="root">The deserialised file.</param>
    /// <param name="relativePath">The file's path relative to the specs directory.</param>
    public static Translations? Parse(object? root, string? relativePath)
    {
        if (root is not IDictionary<object, object> map) return null;
        var type = map.TryGetValue("type", out var t) ? t?.ToString() ?? "" : "";
        var conventional = relativePath?.StartsWith("translations/", StringComparison.Ordinal) == true;
        if (type != "Translations" && !(conventional && type.Length == 0)) return null;
        var locale = map.TryGetValue("locale", out var l) ? l?.ToString() ?? "" : "";
        if (string.IsNullOrWhiteSpace(locale) && relativePath is not null)
            locale = Regex.Replace(Path.GetFileName(relativePath), @"\.ya?ml$", "");
        if (string.IsNullOrWhiteSpace(locale))
        {
            MateuLogging.For("Mateu.I18n").LogWarning("Ignoring translations {File} with no locale", relativePath);
            return null;
        }
        var messages = new Dictionary<string, object?>();
        if (map.TryGetValue("messages", out var m) && m is IDictionary<object, object> tree)
            foreach (var (k, v) in Flatten(tree.ToDictionary(kv => kv.Key.ToString()!, kv => (object?)kv.Value)))
                messages[k] = v;
        return new Translations(locale, messages);
    }

    /// <summary>Nested maps flattened with dots.</summary>
    internal static Dictionary<string, string> Flatten(IReadOnlyDictionary<string, object?>? messages)
    {
        var out_ = new Dictionary<string, string>();
        void Walk(string prefix, object? node)
        {
            switch (node)
            {
                case IDictionary<object, object> map:
                    foreach (var (k, v) in map) Walk(prefix.Length == 0 ? k.ToString()! : prefix + "." + k, v);
                    break;
                case IReadOnlyDictionary<string, object?> typed:
                    foreach (var (k, v) in typed) Walk(prefix.Length == 0 ? k : prefix + "." + k, v);
                    break;
                case IDictionary<string, object?> typed2:
                    foreach (var (k, v) in typed2) Walk(prefix.Length == 0 ? k : prefix + "." + k, v);
                    break;
                case null:
                    break;
                default:
                    if (prefix.Length > 0) out_[prefix] = node is bool b ? (b ? "true" : "false") : node.ToString()!;
                    break;
            }
        }
        if (messages is not null)
            foreach (var (k, v) in messages) Walk(k, v);
        return out_;
    }

    /// <summary>The text of <paramref name="key"/> for <paramref name="locale"/> along the fallback
    /// chain; null when no catalogue has it.</summary>
    public string? Message(string key, string? locale)
    {
        foreach (var candidate in Candidates(locale))
            if (Catalogue.TryGetValue(candidate, out var messages) && messages.TryGetValue(key, out var text))
                return text;
        return null;
    }

    /// <summary>The locales tried for a request locale, most specific first.</summary>
    internal static List<string> Candidates(string? locale)
    {
        var out_ = new List<string>();
        void Add(string l)
        {
            if (l.Length == 0) return;
            if (!out_.Contains(l)) out_.Add(l);
            var dash = l.IndexOf('-');
            if (dash > 0 && !out_.Contains(l[..dash])) out_.Add(l[..dash]);
        }
        Add(Normalize(locale));
        Add(Normalize(FallbackLocale()));
        return out_;
    }

    /// <summary><c>${i18n.key}</c> expressions in <paramref name="text"/> resolved for <paramref name="locale"/>.</summary>
    public string Interpolate(string text, string? locale)
    {
        if (!text.Contains("i18n.")) return text;
        return Expression.Replace(text, m =>
        {
            var key = m.Groups[1].Value;
            if (Message(key, locale) is { } resolved) return resolved;
            if (_warned.TryAdd(Normalize(locale) + "#" + key, true))
                MateuLogging.For("Mateu.I18n").LogWarning(
                    "Missing translation '{Key}' for locale '{Locale}' — showing the key", key, locale);
            return key;
        });
    }

    /// <summary>Whether a deserialised tree mentions an <c>${i18n.…}</c> expression anywhere.</summary>
    public static bool MentionsI18n(object? node) => node switch
    {
        string s => Expression.IsMatch(s),
        IDictionary<object, object> map => map.Values.Any(MentionsI18n),
        IEnumerable<object> list => list.Any(MentionsI18n),
        _ => false,
    };

    /// <summary><paramref name="node"/> (mutated in place) with every <c>${i18n.…}</c> resolved.</summary>
    public object? TranslateTree(object? node, string? locale)
    {
        switch (node)
        {
            case string s:
                return Interpolate(s, locale);
            case IDictionary<object, object> map:
                foreach (var key in map.Keys.ToList()) map[key] = TranslateTree(map[key], locale)!;
                return map;
            case List<object?> list:
                for (var i = 0; i < list.Count; i++) list[i] = TranslateTree(list[i], locale);
                return list;
            default:
                return node;
        }
    }

    /// <summary>The first tag of an <c>Accept-Language</c> header, or null.</summary>
    public static string? AcceptLanguage(string? header)
    {
        if (string.IsNullOrWhiteSpace(header)) return null;
        var tag = header.Split(',')[0].Split(';')[0].Trim();
        return tag.Length == 0 || tag == "*" ? null : tag;
    }

    /// <summary>The locale used when the request's has no catalogue or lacks a key.</summary>
    public static string FallbackLocale()
    {
        var configured = Environment.GetEnvironmentVariable("MATEU_I18N_FALLBACK");
        return string.IsNullOrWhiteSpace(configured) ? "en" : configured.Trim();
    }

    internal static string Normalize(string? locale) =>
        (locale ?? "").Trim().Replace('_', '-').ToLowerInvariant();
}

/// <summary>The translator the mapper uses: the app's own <see cref="ITranslator"/> (if any) first,
/// then the catalogue — <c>${i18n.key}</c> expressions inside the text, or the whole text when it IS
/// a key there. Its <see cref="Locale"/> is the app translator's, else the request's
/// (Accept-Language) — what Java's DefaultTranslator answers.</summary>
public sealed class CatalogueTranslator(ITranslator? inner, TranslationRegistry catalogue, Func<string?> requestLocale)
    : ITranslator
{
    public string Translate(string key)
    {
        var text = inner?.Translate(key) ?? key;
        var locale = Locale;
        if (text.Contains("i18n.")) text = catalogue.Interpolate(text, locale);
        if (catalogue.HasTranslations && catalogue.Message(text, locale) is { } asKey) return asKey;
        return text;
    }

    public string? Locale => inner?.Locale ?? requestLocale();
}
