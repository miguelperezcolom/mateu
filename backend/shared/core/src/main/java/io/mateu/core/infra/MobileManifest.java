package io.mateu.core.infra;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.mateu.core.infra.reflection.ClassLoaders;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.Humanizer;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MobileApp;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.fluent.AppShell;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * {@code GET <baseUrl>/mateu/v3/manifest}: how a UI presents itself to the Mateu mobile app (design
 * {@code design/mobile-app-hub.md}) — its name, icon and colour for the app's list, the wire and
 * minimum app versions, and, optionally, the OpenID Connect provider the host app trusts. The
 * single source for every adapter (MVC, WebFlux, Micronaut, Quarkus, Helidon MP), which only map
 * the path and write back {@link #HEADERS} and the body; the .NET and Python ports build the same
 * JSON, member for member.
 *
 * <p>Public and cacheable: it says nothing a login page would not, and the app fetches it before
 * the user has signed in. Members with no value are omitted, never null. Precedence, per member: a
 * setting ({@link MateuSettings}: JVM system property or {@code MATEU_MOBILE_*} environment
 * variable) &gt; {@link MobileApp} &gt; what the app already declares ({@code @Title},
 * {@code @Logo} / {@code @FavIcon}, {@code @App(accentColor)}).
 *
 * <p>Mateu ships UI only: {@code auth} TELLS the app which identity provider to use; validating the
 * token it then sends is the host application's framework's job, as for any other client.
 */
@Experimental("mobile app (3.0 beta)")
public final class MobileManifest {

  /** Every UI's base URL followed by this is the endpoint. */
  public static final String PATH_SUFFIX = "/mateu/v3/manifest";

  /**
   * The wire version the renderers speak: the SAME value every response envelope carries ({@link
   * io.mateu.dtos.UIIncrementDto#WIRE_VERSION}, "3.0"). It used to be "3"; a reader compares the
   * major only, so both spellings are the same wire to it.
   */
  public static final String WIRE_VERSION = io.mateu.dtos.UIIncrementDto.WIRE_VERSION;

  public static final String DEFAULT_MIN_APP_VERSION = "1.0.0";
  public static final List<String> DEFAULT_SCOPES = List.of("openid", "profile");

  public static final String NAME = "mateu.mobile.name";
  public static final String SHORT_NAME = "mateu.mobile.short-name";
  public static final String ICON = "mateu.mobile.icon";
  public static final String THEME_COLOR = "mateu.mobile.theme-color";
  public static final String MIN_APP_VERSION = "mateu.mobile.min-app-version";
  public static final String OIDC_ISSUER = "mateu.mobile.oidc.issuer";
  public static final String OIDC_CLIENT_ID = "mateu.mobile.oidc.client-id";
  public static final String OIDC_SCOPES = "mateu.mobile.oidc.scopes";

  /** The response headers, the same on every adapter. */
  public static final Map<String, String> HEADERS =
      Map.of(
          "Content-Type", "application/json",
          "Cache-Control", "public, max-age=300",
          "X-Content-Type-Options", "nosniff");

  private MobileManifest() {}

  /** What the manifest is built from, before settings are applied. */
  public record Source(
      String title, String logo, String favicon, String accentColor, MobileApp mobileApp) {}

  /** Whether a GET to {@code path} (no query) is a manifest request. */
  public static boolean isEndpoint(String path) {
    return path != null && path.endsWith(PATH_SUFFIX);
  }

  /** The base URL a manifest path belongs to ({@code /crm/mateu/v3/manifest} → {@code /crm}). */
  public static String baseUrlOf(String path) {
    return isEndpoint(path) ? path.substring(0, path.length() - PATH_SUFFIX.length()) : null;
  }

  /**
   * The manifest of a UI declared by a class ({@code uiId} is its fully-qualified name, as the
   * generated controllers carry it). A class that cannot be loaded gives a manifest named "Mateu".
   */
  public static String json(String uiId) {
    return toJson(build(sourceOf(uiId)));
  }

  /** The manifest of a YAML-defined mount, from its app shell (null: a mount with no shell). */
  public static String json(AppShell shell) {
    return toJson(build(sourceOf(shell)));
  }

  /** The source of a class-declared UI. */
  public static Source sourceOf(String uiId) {
    Class<?> type;
    try {
      type = ClassLoaders.forName(uiId);
    } catch (RuntimeException e) {
      return new Source("Mateu", null, null, null, null);
    }
    String title = value(type, Title.class, Title::value);
    if (title == null) {
      title = value(type, PageTitle.class, PageTitle::value);
    }
    if (title == null) {
      title = Humanizer.toUpperCaseFirst(type.getSimpleName());
    }
    return new Source(
        title,
        value(type, Logo.class, Logo::value),
        value(type, FavIcon.class, FavIcon::value),
        value(type, App.class, App::accentColor),
        MetaAnnotations.isPresent(type, MobileApp.class)
            ? MetaAnnotations.find(type, MobileApp.class)
            : null);
  }

  /** The source of a data-authored app shell. */
  public static Source sourceOf(AppShell shell) {
    if (shell == null) {
      return new Source("Mateu", null, null, null, null);
    }
    String title = blankToNull(shell.title());
    if (title == null) {
      title = blankToNull(shell.pageTitle());
    }
    return new Source(
        title != null ? title : "Mateu",
        blankToNull(shell.logo()),
        blankToNull(shell.favicon()),
        blankToNull(shell.accentColor()),
        null);
  }

  /** The manifest members, in wire order, absent ones left out. */
  public static Map<String, Object> build(Source source) {
    return build(source, io.mateu.core.infra.versioning.MateuVersion.current());
  }

  /**
   * As {@link #build(Source)}, with the running Mateu version given: it travels as {@code
   * mateuVersion} when it names a release, so a hub app can tell whether it predates components
   * this UI may send (the app's own compatibility check — the author declares nothing).
   */
  static Map<String, Object> build(Source source, String mateuVersion) {
    MobileApp declared = source.mobileApp();
    Map<String, Object> manifest = new LinkedHashMap<>();
    String name = first(MateuSettings.get(NAME), attr(declared, MobileApp::name), source.title());
    if (name == null) {
      name = "Mateu";
    }
    manifest.put("name", name);
    manifest.put(
        "shortName",
        first(MateuSettings.get(SHORT_NAME), attr(declared, MobileApp::shortName), name));
    put(
        manifest,
        "icon",
        first(
            MateuSettings.get(ICON),
            attr(declared, MobileApp::icon),
            source.logo(),
            source.favicon()));
    put(
        manifest,
        "themeColor",
        first(
            MateuSettings.get(THEME_COLOR),
            attr(declared, MobileApp::themeColor),
            source.accentColor()));
    manifest.put("wireVersion", WIRE_VERSION);
    manifest.put(
        "minAppVersion",
        first(
            MateuSettings.get(MIN_APP_VERSION),
            attr(declared, MobileApp::minAppVersion),
            DEFAULT_MIN_APP_VERSION));
    put(manifest, "mateuVersion", releaseVersion(mateuVersion));
    // in development mode: where the live-reload events are, so the native renderers (the phone
    // app, the desktop app) re-render on a YAML edit or a HotSwap like the web does from its
    // <meta name="mateu-dev">. Never outside development mode.
    if (io.mateu.core.infra.dev.DevMode.enabled()) {
      manifest.put("devEvents", io.mateu.core.infra.dev.DevEndpoint.EVENTS_PATH);
    }
    String issuer = first(MateuSettings.get(OIDC_ISSUER), attr(declared, MobileApp::oidcIssuer));
    String clientId =
        first(MateuSettings.get(OIDC_CLIENT_ID), attr(declared, MobileApp::oidcClientId));
    if (issuer != null && clientId != null) {
      Map<String, Object> auth = new LinkedHashMap<>();
      auth.put("type", "oidc");
      auth.put("issuer", issuer);
      auth.put("clientId", clientId);
      auth.put("scopes", scopes(declared));
      manifest.put("auth", auth);
    }
    return manifest;
  }

  private static final java.util.regex.Pattern RELEASE =
      java.util.regex.Pattern.compile("^\\d+\\.\\d+(\\.\\d+)?([-.]?(alpha|beta|rc|a|b)\\.?\\d+)?$");

  /**
   * The version when it names a release ({@code 3.0-beta.33}, {@code 3.1.0}, {@code 3.0.0b33}),
   * null for a development build ({@code 0.0.1-MATEU}, {@code …-SNAPSHOT}, {@code 3.0.0.dev0}) or
   * none: an app cannot compare itself with a version that names no release. Same rule in the .NET
   * and Python manifests.
   */
  public static String releaseVersion(String version) {
    if (version == null) return null;
    String v = version.trim();
    if (v.startsWith("0.")) return null;
    return RELEASE.matcher(v).matches() ? v : null;
  }

  /** Compact JSON, members in insertion (wire) order. */
  public static String toJson(Map<String, Object> manifest) {
    try {
      return WireMapper.shared().writeValueAsString(manifest);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  private static List<String> scopes(MobileApp declared) {
    String configured = MateuSettings.get(OIDC_SCOPES);
    if (configured != null) {
      var parsed = split(configured);
      if (!parsed.isEmpty()) {
        return parsed;
      }
    }
    if (declared != null) {
      var parsed = new ArrayList<String>();
      for (String scope : declared.scopes()) {
        parsed.addAll(split(scope));
      }
      if (!parsed.isEmpty()) {
        return parsed;
      }
    }
    return DEFAULT_SCOPES;
  }

  private static List<String> split(String value) {
    return Arrays.stream(value.split("[,\\s]+")).filter(s -> !s.isBlank()).distinct().toList();
  }

  private static <A extends java.lang.annotation.Annotation> String value(
      Class<?> type, Class<A> annotation, Function<A, String> attribute) {
    return MetaAnnotations.isPresent(type, annotation)
        ? blankToNull(attribute.apply(MetaAnnotations.find(type, annotation)))
        : null;
  }

  private static String attr(MobileApp declared, Function<MobileApp, String> attribute) {
    return declared == null ? null : blankToNull(attribute.apply(declared));
  }

  private static String first(String... values) {
    for (String value : values) {
      if (value != null && !value.isBlank()) {
        return value.trim();
      }
    }
    return null;
  }

  private static void put(Map<String, Object> manifest, String key, String value) {
    if (value != null) {
      manifest.put(key, value);
    }
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
