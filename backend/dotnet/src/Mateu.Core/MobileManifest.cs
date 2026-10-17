using System.Reflection;
using System.Text;
using System.Text.Json;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>The UI manifest, <c>GET {base}/mateu/v3/manifest</c>: what the generic Mateu mobile app
/// reads to list a UI (name, short name, icon, theme colour), to know whether it can open it (wire
/// and minimum app version) and where to log in (an OIDC issuer + client id, when declared). Public
/// and cacheable — it carries no secret. Mateu never validates a token: <c>auth</c> only tells the
/// client which identity provider the host app trusts.
///
/// <para>Each member resolves from its environment variable first (values that vary per
/// environment), then <see cref="MobileAppAttribute"/>, then the app itself ([App] title, [Title],
/// the humanized class name). Same members, order and JSON as Java's MobileManifest and Python's
/// mobile_manifest. EXPERIMENTAL (mobile app, 3.0 beta).</para></summary>
public static class MobileManifest
{
    /// <summary>The endpoint under every mount's base path.</summary>
    public const string Path = "/mateu/v3/manifest";

    /// <summary>The wire version this server speaks: the SAME value every response envelope carries
    /// (<see cref="Mateu.Dtos.UIIncrementDto.CurrentWireVersion"/>, "3.0"). It used to be "3"; a
    /// reader compares the major only, so both spellings are the same wire to it.</summary>
    public const string WireVersion = Mateu.Dtos.UIIncrementDto.CurrentWireVersion;

    /// <summary>The minimum app version when none is declared.</summary>
    public const string DefaultMinAppVersion = "1.0.0";

    /// <summary>The scopes requested when none are declared.</summary>
    public static readonly IReadOnlyList<string> DefaultScopes = ["openid", "profile"];

    /// <summary>The response headers: JSON, publicly cacheable for five minutes, never sniffed.</summary>
    public static readonly IReadOnlyDictionary<string, string> Headers = new Dictionary<string, string>
    {
        ["Content-Type"] = "application/json",
        ["Cache-Control"] = "public, max-age=300",
        ["X-Content-Type-Options"] = "nosniff",
    };

    /// <summary>The manifest of the app mounted at <paramref name="baseUrl"/>: the class routed
    /// there, else the registry's [App] class.</summary>
    public static string ForMount(MateuRegistry registry, string? baseUrl)
    {
        var type = registry.Resolve(null, baseUrl ?? "") ?? registry.AppType;
        return Json(type);
    }

    /// <summary>The manifest of <paramref name="appType"/> (null = an anonymous "Mateu" app).</summary>
    public static string Json(Type? appType)
    {
        var mobile = appType?.GetCustomAttribute<MobileAppAttribute>();
        var app = appType?.GetCustomAttribute<AppAttribute>();
        var name = Setting("MATEU_MOBILE_NAME")
                   ?? Blank(mobile?.Name)
                   ?? Blank(app?.Title)
                   ?? Blank(appType?.GetCustomAttribute<TitleAttribute>()?.Value)
                   ?? (appType is null ? "Mateu" : Naming.Humanize(appType.Name));
        var shortName = Setting("MATEU_MOBILE_SHORT_NAME") ?? Blank(mobile?.ShortName) ?? name;
        var icon = Setting("MATEU_MOBILE_ICON") ?? Blank(mobile?.Icon);
        var themeColor = Setting("MATEU_MOBILE_THEME_COLOR") ?? Blank(mobile?.ThemeColor);
        var minAppVersion = Setting("MATEU_MOBILE_MIN_APP_VERSION") ?? Blank(mobile?.MinAppVersion)
                            ?? DefaultMinAppVersion;
        var issuer = Setting("MATEU_MOBILE_OIDC_ISSUER") ?? Blank(mobile?.OidcIssuer);
        var clientId = Setting("MATEU_MOBILE_OIDC_CLIENT_ID") ?? Blank(mobile?.OidcClientId);
        var scopes = Scopes(Setting("MATEU_MOBILE_OIDC_SCOPES"))
                     ?? NonBlank(mobile?.Scopes)
                     ?? DefaultScopes;

        using var buffer = new MemoryStream();
        using (var w = new Utf8JsonWriter(buffer, new JsonWriterOptions
               {
                   Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
               }))
        {
            w.WriteStartObject();
            w.WriteString("name", name);
            w.WriteString("shortName", shortName);
            if (icon is not null) w.WriteString("icon", icon);
            if (themeColor is not null) w.WriteString("themeColor", themeColor);
            w.WriteString("wireVersion", WireVersion);
            w.WriteString("minAppVersion", minAppVersion);
            if (issuer is not null && clientId is not null)
            {
                w.WriteStartObject("auth");
                w.WriteString("type", "oidc");
                w.WriteString("issuer", issuer);
                w.WriteString("clientId", clientId);
                w.WriteStartArray("scopes");
                foreach (var scope in scopes) w.WriteStringValue(scope);
                w.WriteEndArray();
                w.WriteEndObject();
            }
            w.WriteEndObject();
        }
        return Encoding.UTF8.GetString(buffer.ToArray());
    }

    private static string? Setting(string env) => Blank(Environment.GetEnvironmentVariable(env));

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static IReadOnlyList<string>? NonBlank(string[]? values)
    {
        var list = values?.Where(v => !string.IsNullOrWhiteSpace(v)).Select(v => v.Trim()).ToList();
        return list is { Count: > 0 } ? list : null;
    }

    /// <summary>A scopes setting, comma and/or space separated.</summary>
    private static IReadOnlyList<string>? Scopes(string? setting) =>
        setting is null ? null : NonBlank(setting.Split([',', ' ', '\t'], StringSplitOptions.RemoveEmptyEntries));
}
