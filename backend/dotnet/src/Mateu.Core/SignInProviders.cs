using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>What the app declares in code about signing in (<c>MateuOptions.SignIn</c>,
/// <c>LoginOnStart</c>, <c>LogoutUrl</c>).</summary>
internal sealed record SignInDeclared(IReadOnlyList<SignInProvider> Providers, bool? LoginOnStart = null, string? LogoutUrl = null)
{
    /// <summary>Nothing declared in code.</summary>
    public static readonly SignInDeclared None = new([]);
}

/// <summary>The ways to sign in to a UI — the <c>auth</c> block of the mobile manifest and the
/// <c>&lt;meta name="mateu-auth"&gt;</c> of the served page, which every client (web, phone, desktop)
/// offers: one provider → straight to it, several → a sign-in chooser. The .NET twin of Java's
/// <c>io.mateu.core.infra.security.SignInProviders</c> and Python's <c>sign_in_providers</c>: the
/// same rules and JSON byte for byte, pinned by <c>conformance/client/sign-in.json</c>.
///
/// <para>Mateu OFFERS the sign-in; it never validates a token or a session — the host does.</para>
///
/// <para>Where the providers come from, the first that names any wins (never merged): the
/// environment (<c>MATEU_AUTH_PROVIDERS=acme,github</c> + <c>MATEU_AUTH_PROVIDERS_&lt;ID&gt;_TYPE|LABEL|
/// ICON|ISSUER|CLIENT_ID|SCOPES|AUDIENCE|URL|PLATFORMS|CONTINUE_PARAM|TENANT</c>); then
/// <c>MateuOptions.SignIn</c>; then the single provider of before (<c>MATEU_MOBILE_OIDC_*</c> /
/// <c>[MobileApp(OidcIssuer…)]</c>) as the native-only provider <c>default</c>.</para></summary>
internal static class SignInProviders
{
    public const string ProvidersKey = "mateu.auth.providers";
    public const string LoginOnStartKey = "mateu.auth.login-on-start";
    public const string LogoutUrlKey = "mateu.auth.logout-url";
    public const string MetaName = "mateu-auth";

    public static readonly IReadOnlyList<string> DefaultScopes = ["openid", "profile"];

    public static readonly IReadOnlyList<string> Icons =
        ["google", "microsoft", "apple", "github", "facebook", "x", "linkedin", "gitlab", "okta", "auth0", "keycloak", "key"];

    private static readonly string[] AllPlatforms = ["web", "mobile", "desktop"];
    private static readonly string[] WebOnly = ["web"];
    private static readonly string[] NativeOnly = ["mobile", "desktop"];

    private const string MicrosoftIssuer = "https://login.microsoftonline.com/{0}/v2.0";

    private sealed record Preset(string Type, string Label, string Icon, string? Issuer, string[]? Platforms);

    private static readonly Dictionary<string, Preset> Presets = new()
    {
        // Google's web clients need a client secret: a public (PKCE) client is a native one
        ["google"] = new("oidc", "Google", "google", "https://accounts.google.com", NativeOnly),
        ["microsoft"] = new("oidc", "Microsoft", "microsoft", null, null),
        ["entra"] = new("oidc", "Microsoft Entra ID", "microsoft", null, null),
        ["keycloak"] = new("oidc", "Keycloak", "keycloak", null, null),
        ["okta"] = new("oidc", "Okta", "okta", null, null),
        ["auth0"] = new("oidc", "Auth0", "auth0", null, null),
        ["cognito"] = new("oidc", "Amazon Cognito", "key", null, null),
        ["zitadel"] = new("oidc", "Zitadel", "key", null, null),
        ["authentik"] = new("oidc", "Authentik", "key", null, null),
        ["apple"] = new("redirect", "Apple", "apple", null, null),
        ["github"] = new("redirect", "GitHub", "github", null, null),
        ["facebook"] = new("redirect", "Facebook", "facebook", null, null),
        ["x"] = new("redirect", "X", "x", null, null),
        ["linkedin"] = new("redirect", "LinkedIn", "linkedin", null, null),
        ["gitlab"] = new("redirect", "GitLab", "gitlab", null, null),
    };

    private static readonly Regex IdPattern = new("^[A-Za-z0-9_-]+$");
    private static readonly Regex HttpUrl = new("^https?://[^\\s\"'<>]+$", RegexOptions.IgnoreCase);
    private static readonly Regex PathUrl = new("^/(?!/)[^\\s\"'<>]*$");

    private sealed record Input(
        string? Id, string? Type = null, string? Label = null, string? Icon = null, string? Issuer = null,
        string? ClientId = null, IReadOnlyList<string>? Scopes = null, string? Audience = null, string? Url = null,
        IReadOnlyList<string>? Platforms = null, bool? ContinueParam = null, string? Tenant = null);

    private static readonly HashSet<string> Warned = [];

    /// <summary>Java's <c>MateuSettings.envName</c>: upper-cased, '.' and '-' as '_'.</summary>
    public static string EnvName(string key) => key.ToUpperInvariant().Replace('.', '_').Replace('-', '_');

    /// <summary>A setting read from its environment variable.</summary>
    public static string? FromEnvironment(string key) => Environment.GetEnvironmentVariable(EnvName(key));

    /// <summary>The <c>auth</c> block from the environment, the code-declared providers and the
    /// app's [MobileApp]; null when there is no provider. Each unusable provider is logged once
    /// through <paramref name="warn"/> (default: stderr-free, collected for <see cref="Warnings"/>).</summary>
    public static JsonObject? AuthBlock(SignInDeclared? declared, MobileAppAttribute? mobile, Action<string>? warn = null) =>
        AuthBlock(FromEnvironment, declared ?? SignInDeclared.None, mobile, warn ?? WarnOnce);

    /// <summary>The rules, with the settings read through <paramref name="settings"/>.</summary>
    public static JsonObject? AuthBlock(Func<string, string?> settings, SignInDeclared declared, MobileAppAttribute? mobile, Action<string> warn)
    {
        var providers = Providers(settings, declared, mobile, warn);
        if (providers.Count == 0) return null;
        var auth = new JsonObject();
        var first = providers.FirstOrDefault(p => (string?)p["type"] == "oidc" && PlatformsOf(p).Contains("mobile"));
        if (first is not null)
        {
            auth["type"] = "oidc";
            auth["issuer"] = (string?)first["issuer"];
            auth["clientId"] = (string?)first["clientId"];
            auth["scopes"] = first["scopes"]!.DeepClone();
            if (first["audience"] is not null) auth["audience"] = (string?)first["audience"];
        }
        auth["loginOnStart"] = LoginOnStart(settings, declared, warn);
        var array = new JsonArray();
        foreach (var p in providers) array.Add(p);
        auth["providers"] = array;
        var logoutUrl = Blank(settings(LogoutUrlKey)) ?? Blank(declared.LogoutUrl);
        if (logoutUrl is not null)
        {
            if (UsableUrl(logoutUrl)) auth["logoutUrl"] = logoutUrl;
            else warn($"Sign-in: {LogoutUrlKey} is ignored: it must be a path of this site or an http(s) URL.");
        }
        return auth;
    }

    /// <summary>What the WEB clients get: only the providers offered on the web; null when none.</summary>
    public static JsonObject? WebBlock(JsonObject? auth)
    {
        if (auth is null) return null;
        var web = new JsonArray();
        foreach (var p in auth["providers"]!.AsArray())
            if (PlatformsOf(p!.AsObject()).Contains("web")) web.Add(p.DeepClone());
        if (web.Count == 0) return null;
        var block = new JsonObject
        {
            ["loginOnStart"] = auth["loginOnStart"]!.DeepClone(),
            ["providers"] = web,
        };
        if (auth["logoutUrl"] is not null) block["logoutUrl"] = auth["logoutUrl"]!.DeepClone();
        return block;
    }

    private static readonly JsonSerializerOptions Compact = new()
    {
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        WriteIndented = false,
    };

    /// <summary>Compact JSON, members in insertion (wire) order — the manifest's encoding.</summary>
    public static string ToJson(JsonNode node) => node.ToJsonString(Compact);

    /// <summary>The <c>&lt;meta name="mateu-auth"&gt;</c> tag for <paramref name="auth"/>, or null.</summary>
    public static string? Meta(JsonObject? auth)
    {
        var web = WebBlock(auth);
        return web is null ? null : "<meta name=\"" + MetaName + "\" content=\"" + HtmlEscape(ToJson(web)) + "\">";
    }

    /// <summary><paramref name="html"/> with the meta tag before <c>&lt;/head&gt;</c>, when any.</summary>
    public static string Head(string html, SignInDeclared? declared, MobileAppAttribute? mobile)
    {
        if (string.IsNullOrEmpty(html) || !html.Contains("</head>", StringComparison.Ordinal)
            || html.Contains("name=\"" + MetaName + "\"", StringComparison.Ordinal)) return html;
        var tag = Meta(AuthBlock(declared, mobile));
        if (tag is null) return html;
        var at = html.IndexOf("</head>", StringComparison.Ordinal);
        return html[..at] + tag + html[at..];
    }

    /// <summary>The warnings logged so far (each once), for the startup log.</summary>
    public static IReadOnlyCollection<string> Warnings
    {
        get { lock (Warned) return Warned.ToList(); }
    }

    /// <summary>Resolves the providers once and hands every warning to <paramref name="log"/> —
    /// called when the app starts, so an unusable provider is reported then.</summary>
    public static void WarnOnStartup(SignInDeclared? declared, MobileAppAttribute? mobile, Action<string> log)
    {
        try
        {
            AuthBlock(FromEnvironment, declared ?? SignInDeclared.None, mobile, log);
        }
        catch (Exception e)
        {
            log("Sign-in providers could not be read: " + e.Message);
        }
    }

    internal static string HtmlEscape(string value) => value
        .Replace("&", "&amp;").Replace("\"", "&quot;").Replace("'", "&#39;").Replace("<", "&lt;").Replace(">", "&gt;");

    /// <summary><c>acme-sso</c> → <c>Acme sso</c>.</summary>
    internal static string Humanize(string id)
    {
        var spaced = Regex.Replace(id, "[-_]+", " ").Trim();
        return spaced.Length == 0 ? id : char.ToUpperInvariant(spaced[0]) + spaced[1..];
    }

    private static void WarnOnce(string message)
    {
        lock (Warned)
        {
            if (Warned.Count < 256) Warned.Add(message);
        }
    }

    private static List<JsonObject> Providers(Func<string, string?> settings, SignInDeclared declared, MobileAppAttribute? mobile, Action<string> warn)
    {
        List<Input> inputs;
        var ids = Split(settings(ProvidersKey));
        if (ids.Count > 0) inputs = ids.Select(id => FromSettings(id, settings)).ToList();
        else if (declared.Providers.Count > 0) inputs = declared.Providers.Where(p => p is not null).Select(FromCode).ToList();
        else inputs = Legacy(settings, mobile) is { } legacy ? [legacy] : [];
        var output = new List<JsonObject>();
        var seen = new HashSet<string>();
        foreach (var input in inputs)
        {
            if (input.Id is null || !IdPattern.IsMatch(input.Id))
            {
                warn($"Sign-in provider '{input.Id}' is skipped: an id is letters, digits, '-' and '_' only.");
                continue;
            }
            if (!seen.Add(input.Id))
            {
                warn($"Sign-in provider '{input.Id}' is declared twice: the first one wins.");
                continue;
            }
            if (Resolve(input, warn) is { } provider) output.Add(provider);
        }
        return output;
    }

    private static JsonObject? Resolve(Input i, Action<string> warn)
    {
        var id = i.Id!;
        var lowerId = id.ToLowerInvariant();
        Presets.TryGetValue(lowerId, out var preset);
        var url = Blank(i.Url);
        var type = Blank(i.Type) ?? (preset is not null ? preset.Type : url is not null ? "redirect" : "oidc");
        type = type.ToLowerInvariant();
        var key = ProvidersKey + "." + id;
        if (type != "oidc" && type != "redirect")
        {
            warn($"Sign-in provider '{id}' is skipped: its type '{type}' is neither oidc nor redirect ({key}.type).");
            return null;
        }
        var p = new JsonObject { ["id"] = id, ["type"] = type };
        p["label"] = Blank(i.Label) ?? preset?.Label ?? Humanize(id);
        p["icon"] = IconOf(i.Icon, preset, id, warn);
        var platforms = PlatformsOf(i.Platforms, id, warn);
        if (type == "oidc")
        {
            var issuer = Blank(i.Issuer);
            if (issuer is null && preset is not null)
            {
                issuer = preset.Issuer;
                var tenant = Blank(i.Tenant);
                if (lowerId == "microsoft") issuer = string.Format(MicrosoftIssuer, tenant ?? "common");
                else if (lowerId == "entra" && tenant is not null) issuer = string.Format(MicrosoftIssuer, tenant);
            }
            var clientId = Blank(i.ClientId);
            if (issuer is null || clientId is null)
            {
                warn($"Sign-in provider '{id}' is skipped: an oidc provider needs an issuer and a client id ({key}.issuer, {key}.client-id).");
                return null;
            }
            if (!HttpUrl.IsMatch(issuer))
            {
                warn($"Sign-in provider '{id}' is skipped: its issuer must be an http(s) URL ({key}.issuer).");
                return null;
            }
            p["issuer"] = issuer;
            p["clientId"] = clientId;
            var scopes = Clean(i.Scopes);
            p["scopes"] = ToArray(scopes.Count > 0 ? scopes : DefaultScopes);
            if (Blank(i.Audience) is { } audience) p["audience"] = audience;
            p["platforms"] = ToArray(platforms ?? preset?.Platforms ?? (IReadOnlyList<string>)AllPlatforms);
        }
        else
        {
            if (url is null && preset is not null) url = "/oauth2/authorization/" + id;
            if (url is null || !UsableUrl(url))
            {
                warn($"Sign-in provider '{id}' is skipped: a redirect provider needs a url, a path of this site or an http(s) URL ({key}.url).");
                return null;
            }
            p["url"] = url;
            if (i.ContinueParam == false) p["continueParam"] = false;
            p["platforms"] = ToArray(platforms ?? (IReadOnlyList<string>)WebOnly);
        }
        return p;
    }

    private static Input FromSettings(string id, Func<string, string?> settings)
    {
        var key = ProvidersKey + "." + id + ".";
        string? S(string name) => Blank(settings(key + name));
        var scopes = S("scopes");
        var platforms = S("platforms");
        var continueParam = S("continue-param");
        return new Input(id, S("type"), S("label"), S("icon"), S("issuer"), S("client-id"),
            scopes is null ? null : Split(scopes), S("audience"), S("url"),
            platforms is null ? null : Split(platforms),
            continueParam is null ? null : !continueParam.Equals("false", StringComparison.OrdinalIgnoreCase),
            S("tenant"));
    }

    private static Input FromCode(SignInProvider p) =>
        new(Blank(p.Id), Blank(p.Type), p.Label, p.Icon, p.Issuer, p.ClientId, p.Scopes, p.Audience, p.Url, p.Platforms, p.ContinueParam);

    private static Input? Legacy(Func<string, string?> settings, MobileAppAttribute? mobile)
    {
        var issuer = Blank(settings("mateu.mobile.oidc.issuer")) ?? Blank(mobile?.OidcIssuer);
        var clientId = Blank(settings("mateu.mobile.oidc.client-id")) ?? Blank(mobile?.OidcClientId);
        if (issuer is null || clientId is null) return null;
        IReadOnlyList<string> scopes = Split(settings("mateu.mobile.oidc.scopes"));
        if (scopes.Count == 0 && mobile is not null) scopes = Clean(mobile.Scopes);
        // native only, as it always was: its client id is the phone/desktop app's
        return new Input("default", "oidc", "Sign in", "key", issuer, clientId, scopes, Platforms: NativeOnly);
    }

    private static bool LoginOnStart(Func<string, string?> settings, SignInDeclared declared, Action<string> warn)
    {
        var setting = Blank(settings(LoginOnStartKey));
        if (setting is not null)
        {
            if (setting.Equals("true", StringComparison.OrdinalIgnoreCase)) return true;
            if (setting.Equals("false", StringComparison.OrdinalIgnoreCase)) return false;
            warn($"Sign-in: {LoginOnStartKey} is neither true nor false; it stays true.");
        }
        return declared.LoginOnStart ?? true;
    }

    private static string IconOf(string? given, Preset? preset, string id, Action<string> warn)
    {
        var icon = Blank(given);
        if (icon is not null)
        {
            var lower = icon.ToLowerInvariant();
            if (Icons.Contains(lower)) return lower;
            warn($"Sign-in provider '{id}': icon '{icon}' is not one of {string.Join("|", Icons)}; 'key' is shown.");
            return "key";
        }
        return preset?.Icon ?? "key";
    }

    private static IReadOnlyList<string>? PlatformsOf(IReadOnlyList<string>? given, string id, Action<string> warn)
    {
        if (given is null) return null;
        var named = new HashSet<string>();
        foreach (var raw in given)
        {
            var p = Blank(raw);
            if (p is null) continue;
            var lower = p.ToLowerInvariant();
            if (AllPlatforms.Contains(lower)) named.Add(lower);
            else warn($"Sign-in provider '{id}': platform '{p}' is not web, mobile or desktop.");
        }
        var ordered = AllPlatforms.Where(named.Contains).ToList();
        return ordered.Count == 0 ? null : ordered;
    }

    private static List<string> PlatformsOf(JsonObject provider) =>
        provider["platforms"]!.AsArray().Select(n => (string)n!).ToList();

    private static JsonArray ToArray(IEnumerable<string> values)
    {
        var array = new JsonArray();
        foreach (var v in values) array.Add(v);
        return array;
    }

    private static bool UsableUrl(string url) => PathUrl.IsMatch(url) || HttpUrl.IsMatch(url);

    private static List<string> Split(string? value)
    {
        var output = new List<string>();
        if (value is null) return output;
        foreach (var part in Regex.Split(value, "[,\\s]+"))
            if (part.Length > 0 && !output.Contains(part)) output.Add(part);
        return output;
    }

    private static List<string> Clean(IEnumerable<string>? values)
    {
        var output = new List<string>();
        if (values is null) return output;
        foreach (var v in values)
            foreach (var s in Split(v))
                if (!output.Contains(s)) output.Add(s);
        return output;
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
