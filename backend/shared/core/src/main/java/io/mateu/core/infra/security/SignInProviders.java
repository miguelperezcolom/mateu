package io.mateu.core.infra.security;

import io.mateu.core.infra.MateuSettings;
import io.mateu.core.infra.WireMapper;
import io.mateu.uidl.annotations.MobileApp;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.security.SignInPlatform;
import io.mateu.uidl.security.SignInProvider;
import io.mateu.uidl.security.SignInProvidersSupplier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;

/**
 * The ways to sign in to a UI — the {@code auth} block of the mobile manifest and the {@code <meta
 * name="mateu-auth">} of the served web page, which every client (web, phone, desktop) offers: one
 * provider → straight to it, several → a sign-in chooser.
 *
 * <p>Mateu OFFERS the sign-in; it never validates a token or a session — the host framework does.
 *
 * <p>Where the providers come from, the first that names any wins (never merged):
 *
 * <ol>
 *   <li>the settings: {@code mateu.auth.providers=acme,github} (display order) with {@code
 *       mateu.auth.providers.<id>.type|label|icon|issuer|client-id|scopes|audience|url|platforms|
 *       continue-param|tenant};
 *   <li>the {@link SignInProvidersSupplier} beans;
 *   <li>the single provider of before ({@code mateu.mobile.oidc.issuer|client-id|scopes} /
 *       {@code @MobileApp(oidcIssuer, oidcClientId, scopes)}), as provider {@code default}.
 * </ol>
 *
 * A well-known id fills in what is not given (the presets: {@code google}, {@code microsoft},
 * {@code github}…). A provider that cannot be used (an oidc one without issuer or client id, a
 * redirect one without a usable url, an unknown type) is skipped with one WARN. The same rules, the
 * same JSON byte for byte, in the .NET ({@code SignInProviders.cs}) and Python ({@code
 * sign_in_providers.py}) ports, pinned by {@code conformance/client/sign-in.json}.
 */
@Slf4j
public final class SignInProviders {

  public static final String PROVIDERS = "mateu.auth.providers";
  public static final String LOGIN_ON_START = "mateu.auth.login-on-start";
  public static final String LOGOUT_URL = "mateu.auth.logout-url";

  /** The meta tag's name on the served page. */
  public static final String META_NAME = "mateu-auth";

  public static final List<String> DEFAULT_SCOPES = List.of("openid", "profile");

  /** The brand tokens a client knows how to draw (a neutral glyph, never trademark artwork). */
  public static final List<String> ICONS =
      List.of(
          "google",
          "microsoft",
          "apple",
          "github",
          "facebook",
          "x",
          "linkedin",
          "gitlab",
          "okta",
          "auth0",
          "keycloak",
          "key");

  private static final List<String> ALL_PLATFORMS = List.of("web", "mobile", "desktop");
  private static final List<String> WEB_ONLY = List.of("web");
  private static final List<String> NATIVE_ONLY = List.of("mobile", "desktop");

  /** A well-known provider: what an id fills in when it is not given. */
  record Preset(String type, String label, String icon, String issuer, List<String> platforms) {}

  /** {@code tenant} placeholder of the Microsoft issuer. */
  static final String MICROSOFT_ISSUER = "https://login.microsoftonline.com/%s/v2.0";

  static final Map<String, Preset> PRESETS = presets();

  private static Map<String, Preset> presets() {
    var p = new LinkedHashMap<String, Preset>();
    // Google's web clients need a client secret: a public (PKCE) client is a native one, so on the
    // web Google is reached through the framework (a redirect provider), see the sign-in guide.
    p.put(
        "google",
        new Preset("oidc", "Google", "google", "https://accounts.google.com", NATIVE_ONLY));
    p.put("microsoft", new Preset("oidc", "Microsoft", "microsoft", null, null));
    p.put("entra", new Preset("oidc", "Microsoft Entra ID", "microsoft", null, null));
    p.put("keycloak", new Preset("oidc", "Keycloak", "keycloak", null, null));
    p.put("okta", new Preset("oidc", "Okta", "okta", null, null));
    p.put("auth0", new Preset("oidc", "Auth0", "auth0", null, null));
    p.put("cognito", new Preset("oidc", "Amazon Cognito", "key", null, null));
    p.put("zitadel", new Preset("oidc", "Zitadel", "key", null, null));
    p.put("authentik", new Preset("oidc", "Authentik", "key", null, null));
    p.put("apple", new Preset("redirect", "Apple", "apple", null, null));
    p.put("github", new Preset("redirect", "GitHub", "github", null, null));
    p.put("facebook", new Preset("redirect", "Facebook", "facebook", null, null));
    p.put("x", new Preset("redirect", "X", "x", null, null));
    p.put("linkedin", new Preset("redirect", "LinkedIn", "linkedin", null, null));
    p.put("gitlab", new Preset("redirect", "GitLab", "gitlab", null, null));
    return Map.copyOf(p);
  }

  private static final Pattern ID = Pattern.compile("[A-Za-z0-9_-]+");
  private static final Pattern HTTP_URL = Pattern.compile("(?i)^https?://[^\\s\"'<>]+$");
  private static final Pattern PATH_URL = Pattern.compile("^/(?!/)[^\\s\"'<>]*$");

  /** What a provider is built from, before presets and defaults (all optional but the id). */
  record Input(
      String id,
      String type,
      String label,
      String icon,
      String issuer,
      String clientId,
      List<String> scopes,
      String audience,
      String url,
      List<String> platforms,
      Boolean continueParam,
      String tenant) {}

  /** Providers declared in code, with the two block-level members a supplier may answer. */
  record Supplied(List<SignInProvider> providers, Boolean loginOnStart, String logoutUrl) {
    static final Supplied NONE = new Supplied(List.of(), null, null);
  }

  private static final Set<String> WARNED = ConcurrentHashMap.newKeySet();

  private SignInProviders() {}

  // ---------------------------------------------------------------------------------- entry points

  /**
   * The manifest's {@code auth} block for a UI ({@code declared}: its {@code @MobileApp}, may be
   * null), from the settings, the supplier beans or the single provider of before; null when no
   * provider is declared.
   */
  public static Map<String, Object> authBlock(MobileApp declared) {
    return authBlock(MateuSettings::get, supplied(), declared, SignInProviders::warnOnce);
  }

  /** {@code html} with the {@code <meta name="mateu-auth">} before {@code </head>}, when any. */
  public static String head(String html, MobileApp declared) {
    if (html == null || !html.contains("</head>") || html.contains("name=\"" + META_NAME + "\"")) {
      return html;
    }
    var meta = meta(authBlock(declared));
    return meta == null ? html : html.replace("</head>", meta + "</head>");
  }

  /**
   * Resolves every declared provider once and logs a WARN for each one that cannot be used. Called
   * by every adapter once the application has started ({@link IdentityResolver#warnOnStartup}).
   */
  public static void warnOnStartup() {
    try {
      authBlock((MobileApp) null);
    } catch (RuntimeException e) {
      log.warn("Sign-in providers could not be read: {}", e.toString());
    }
  }

  // ------------------------------------------------------------------------------------- the rules

  /** The {@code auth} block (wire order, nulls omitted), or null when there is no provider. */
  static Map<String, Object> authBlock(
      Function<String, String> settings,
      Supplied supplied,
      MobileApp declared,
      Consumer<String> warn) {
    var providers = providers(settings, supplied, declared, warn);
    if (providers.isEmpty()) {
      return null;
    }
    var auth = new LinkedHashMap<String, Object>();
    providers.stream()
        .filter(p -> "oidc".equals(p.get("type")) && platformsOf(p).contains("mobile"))
        .findFirst()
        .ifPresent(
            first -> {
              auth.put("type", "oidc");
              auth.put("issuer", first.get("issuer"));
              auth.put("clientId", first.get("clientId"));
              auth.put("scopes", first.get("scopes"));
              if (first.get("audience") != null) {
                auth.put("audience", first.get("audience"));
              }
            });
    auth.put("loginOnStart", loginOnStart(settings, supplied, warn));
    auth.put("providers", providers);
    var logoutUrl = blank(settings.apply(LOGOUT_URL));
    if (logoutUrl == null) {
      logoutUrl = blank(supplied.logoutUrl());
    }
    if (logoutUrl != null) {
      if (usableUrl(logoutUrl)) {
        auth.put("logoutUrl", logoutUrl);
      } else {
        warn.accept(
            "Sign-in: "
                + LOGOUT_URL
                + " is ignored: it must be a path of this site or an http(s) URL.");
      }
    }
    return auth;
  }

  /** The block the WEB clients get: only the providers offered on the web; null when none. */
  public static Map<String, Object> webBlock(Map<String, Object> auth) {
    if (auth == null) {
      return null;
    }
    @SuppressWarnings("unchecked")
    var all = (List<Map<String, Object>>) auth.get("providers");
    var web = all.stream().filter(p -> platformsOf(p).contains("web")).toList();
    if (web.isEmpty()) {
      return null;
    }
    var block = new LinkedHashMap<String, Object>();
    block.put("loginOnStart", auth.get("loginOnStart"));
    block.put("providers", web);
    if (auth.get("logoutUrl") != null) {
      block.put("logoutUrl", auth.get("logoutUrl"));
    }
    return block;
  }

  /** The {@code <meta name="mateu-auth">} tag for {@code auth}, or null when no web provider. */
  public static String meta(Map<String, Object> auth) {
    var web = webBlock(auth);
    return web == null
        ? null
        : "<meta name=\"" + META_NAME + "\" content=\"" + htmlEscape(toJson(web)) + "\">";
  }

  /** Compact JSON, members in insertion (wire) order. */
  public static String toJson(Object value) {
    try {
      return WireMapper.shared().writeValueAsString(value);
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  /** The five characters that matter in an HTML attribute value. */
  static String htmlEscape(String value) {
    return value
        .replace("&", "&amp;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;")
        .replace("<", "&lt;")
        .replace(">", "&gt;");
  }

  static List<Map<String, Object>> providers(
      Function<String, String> settings,
      Supplied supplied,
      MobileApp declared,
      Consumer<String> warn) {
    List<Input> inputs;
    var ids = split(settings.apply(PROVIDERS));
    if (!ids.isEmpty()) {
      inputs = ids.stream().map(id -> fromSettings(id, settings)).toList();
    } else if (!supplied.providers().isEmpty()) {
      inputs = supplied.providers().stream().map(SignInProviders::fromCode).toList();
    } else {
      var legacy = legacy(settings, declared);
      inputs = legacy == null ? List.of() : List.of(legacy);
    }
    var out = new ArrayList<Map<String, Object>>();
    var seen = new LinkedHashSet<String>();
    for (var input : inputs) {
      if (input.id() == null || !ID.matcher(input.id()).matches()) {
        warn.accept(
            "Sign-in provider '"
                + input.id()
                + "' is skipped: an id is letters, digits, '-' and '_' only.");
        continue;
      }
      if (!seen.add(input.id())) {
        warn.accept("Sign-in provider '" + input.id() + "' is declared twice: the first one wins.");
        continue;
      }
      var provider = resolve(input, warn);
      if (provider != null) {
        out.add(provider);
      }
    }
    return out;
  }

  /** One provider in wire shape, or null (warned) when it cannot be used. */
  static Map<String, Object> resolve(Input in, Consumer<String> warn) {
    var id = in.id();
    var preset = PRESETS.get(id.toLowerCase(Locale.ROOT));
    var url = blank(in.url());
    var type = blank(in.type());
    if (type == null) {
      type = preset != null ? preset.type() : url != null ? "redirect" : "oidc";
    }
    type = type.toLowerCase(Locale.ROOT);
    var key = PROVIDERS + "." + id;
    if (!type.equals("oidc") && !type.equals("redirect")) {
      warn.accept(
          "Sign-in provider '"
              + id
              + "' is skipped: its type '"
              + type
              + "' is neither oidc nor redirect ("
              + key
              + ".type).");
      return null;
    }
    var p = new LinkedHashMap<String, Object>();
    p.put("id", id);
    p.put("type", type);
    var label = blank(in.label());
    p.put("label", label != null ? label : preset != null ? preset.label() : humanize(id));
    p.put("icon", icon(in.icon(), preset, id, warn));
    var platforms = platforms(in.platforms(), id, warn);
    if (type.equals("oidc")) {
      var issuer = blank(in.issuer());
      if (issuer == null && preset != null) {
        issuer = preset.issuer();
        // Microsoft: the issuer is the tenant's (organizations, consumers, a tenant id…);
        // "microsoft" defaults to the multi-tenant "common", "entra" needs its tenant
        var tenant = blank(in.tenant());
        var lower = id.toLowerCase(Locale.ROOT);
        if (lower.equals("microsoft")) {
          issuer = String.format(MICROSOFT_ISSUER, tenant != null ? tenant : "common");
        } else if (lower.equals("entra") && tenant != null) {
          issuer = String.format(MICROSOFT_ISSUER, tenant);
        }
      }
      var clientId = blank(in.clientId());
      if (issuer == null || clientId == null) {
        warn.accept(
            "Sign-in provider '"
                + id
                + "' is skipped: an oidc provider needs an issuer and a client id ("
                + key
                + ".issuer, "
                + key
                + ".client-id).");
        return null;
      }
      if (!HTTP_URL.matcher(issuer).matches()) {
        warn.accept(
            "Sign-in provider '"
                + id
                + "' is skipped: its issuer must be an http(s) URL ("
                + key
                + ".issuer).");
        return null;
      }
      p.put("issuer", issuer);
      p.put("clientId", clientId);
      var scopes = in.scopes() == null ? List.<String>of() : clean(in.scopes());
      p.put("scopes", scopes.isEmpty() ? DEFAULT_SCOPES : scopes);
      var audience = blank(in.audience());
      if (audience != null) {
        p.put("audience", audience);
      }
      p.put(
          "platforms",
          platforms != null
              ? platforms
              : preset != null && preset.platforms() != null ? preset.platforms() : ALL_PLATFORMS);
    } else {
      if (url == null && preset != null) {
        url = "/oauth2/authorization/" + id;
      }
      if (url == null || !usableUrl(url)) {
        warn.accept(
            "Sign-in provider '"
                + id
                + "' is skipped: a redirect provider needs a url, a path of this site or an"
                + " http(s) URL ("
                + key
                + ".url).");
        return null;
      }
      p.put("url", url);
      if (Boolean.FALSE.equals(in.continueParam())) {
        p.put("continueParam", false);
      }
      p.put("platforms", platforms != null ? platforms : WEB_ONLY);
    }
    return p;
  }

  // ------------------------------------------------------------------------------------ the inputs

  static Input fromSettings(String id, Function<String, String> settings) {
    var key = PROVIDERS + "." + id + ".";
    Function<String, String> s = name -> blank(settings.apply(key + name));
    var scopes = s.apply("scopes");
    var platforms = s.apply("platforms");
    var continueParam = s.apply("continue-param");
    return new Input(
        id,
        s.apply("type"),
        s.apply("label"),
        s.apply("icon"),
        s.apply("issuer"),
        s.apply("client-id"),
        scopes == null ? null : split(scopes),
        s.apply("audience"),
        s.apply("url"),
        platforms == null ? null : split(platforms),
        continueParam == null ? null : !"false".equalsIgnoreCase(continueParam),
        s.apply("tenant"));
  }

  static Input fromCode(SignInProvider p) {
    return new Input(
        blank(p.id()),
        p.type() == null ? null : p.type().name(),
        p.label(),
        p.icon(),
        p.issuer(),
        p.clientId(),
        p.scopes(),
        p.audience(),
        p.url(),
        p.platforms() == null ? null : p.platforms().stream().map(SignInPlatform::name).toList(),
        p.continueParam(),
        null);
  }

  /** The provider of before, from {@code mateu.mobile.oidc.*} / {@code @MobileApp}. */
  static Input legacy(Function<String, String> settings, MobileApp declared) {
    var issuer =
        first(
            settings.apply("mateu.mobile.oidc.issuer"),
            declared == null ? null : declared.oidcIssuer());
    var clientId =
        first(
            settings.apply("mateu.mobile.oidc.client-id"),
            declared == null ? null : declared.oidcClientId());
    if (issuer == null || clientId == null) {
      return null;
    }
    var scopes = split(settings.apply("mateu.mobile.oidc.scopes"));
    if (scopes.isEmpty() && declared != null) {
      var all = new ArrayList<String>();
      for (var scope : declared.scopes()) {
        all.addAll(split(scope));
      }
      scopes = all.stream().distinct().toList();
    }
    // native only, as it always was: its client id is the phone/desktop app's (a custom-scheme
    // redirect), which a browser could not complete — the web declares its providers explicitly
    return new Input(
        "default",
        "oidc",
        "Sign in",
        "key",
        issuer,
        clientId,
        scopes,
        null,
        null,
        NATIVE_ONLY,
        null,
        null);
  }

  static Supplied supplied() {
    if (!MateuBeanProvider.isInitialized()) {
      return Supplied.NONE;
    }
    Collection<SignInProvidersSupplier> beans;
    try {
      beans = MateuBeanProvider.getSingletonBeans(SignInProvidersSupplier.class);
    } catch (RuntimeException e) {
      return Supplied.NONE;
    }
    return suppliedBy(beans);
  }

  /** What the given suppliers declare, in their order. */
  static Supplied suppliedBy(Collection<SignInProvidersSupplier> beans) {
    if (beans == null || beans.isEmpty()) {
      return Supplied.NONE;
    }
    var providers = new ArrayList<SignInProvider>();
    Boolean loginOnStart = null;
    String logoutUrl = null;
    for (var bean : beans) {
      var declared = bean.signInProviders();
      if (declared != null) {
        declared.stream().filter(java.util.Objects::nonNull).forEach(providers::add);
      }
      if (loginOnStart == null) {
        loginOnStart = bean.loginOnStart();
      }
      if (logoutUrl == null) {
        logoutUrl = blank(bean.logoutUrl());
      }
    }
    return new Supplied(providers, loginOnStart, logoutUrl);
  }

  // ------------------------------------------------------------------------------------- helpers

  private static boolean loginOnStart(
      Function<String, String> settings, Supplied supplied, Consumer<String> warn) {
    var setting = blank(settings.apply(LOGIN_ON_START));
    if (setting != null) {
      if (setting.equalsIgnoreCase("true")) return true;
      if (setting.equalsIgnoreCase("false")) return false;
      warn.accept("Sign-in: " + LOGIN_ON_START + " is neither true nor false; it stays true.");
    }
    return supplied.loginOnStart() == null || supplied.loginOnStart();
  }

  private static String icon(String given, Preset preset, String id, Consumer<String> warn) {
    var icon = blank(given);
    if (icon != null) {
      var lower = icon.toLowerCase(Locale.ROOT);
      if (ICONS.contains(lower)) {
        return lower;
      }
      warn.accept(
          "Sign-in provider '"
              + id
              + "': icon '"
              + icon
              + "' is not one of "
              + String.join("|", ICONS)
              + "; 'key' is shown.");
      return "key";
    }
    return preset != null ? preset.icon() : "key";
  }

  /** The declared platforms in canonical order, unknown ones warned and dropped; null = none. */
  private static List<String> platforms(List<String> given, String id, Consumer<String> warn) {
    if (given == null) {
      return null;
    }
    var named = new LinkedHashSet<String>();
    for (var raw : given) {
      var p = blank(raw);
      if (p == null) continue;
      var lower = p.toLowerCase(Locale.ROOT);
      if (ALL_PLATFORMS.contains(lower)) {
        named.add(lower);
      } else {
        warn.accept(
            "Sign-in provider '" + id + "': platform '" + p + "' is not web, mobile or desktop.");
      }
    }
    var ordered = ALL_PLATFORMS.stream().filter(named::contains).toList();
    return ordered.isEmpty() ? null : ordered;
  }

  @SuppressWarnings("unchecked")
  private static List<String> platformsOf(Map<String, Object> provider) {
    return (List<String>) provider.get("platforms");
  }

  private static boolean usableUrl(String url) {
    return PATH_URL.matcher(url).matches() || HTTP_URL.matcher(url).matches();
  }

  /** {@code acme-sso} → {@code Acme sso}. */
  static String humanize(String id) {
    var spaced = id.replaceAll("[-_]+", " ").trim();
    if (spaced.isEmpty()) {
      return id;
    }
    return spaced.substring(0, 1).toUpperCase(Locale.ROOT) + spaced.substring(1);
  }

  private static List<String> split(String value) {
    if (value == null) return List.of();
    return Arrays.stream(value.split("[,\\s]+")).filter(s -> !s.isBlank()).distinct().toList();
  }

  private static List<String> clean(List<String> values) {
    var out = new ArrayList<String>();
    for (var v : values) {
      out.addAll(split(v));
    }
    return out.stream().distinct().toList();
  }

  private static String first(String... values) {
    for (var v : values) {
      var b = blank(v);
      if (b != null) return b;
    }
    return null;
  }

  private static String blank(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  private static void warnOnce(String message) {
    if (WARNED.size() < 256 && WARNED.add(message)) {
      log.warn(message);
    }
  }
}
