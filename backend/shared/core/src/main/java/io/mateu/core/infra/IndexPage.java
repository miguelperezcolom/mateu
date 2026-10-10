package io.mateu.core.infra;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Builds the SPA shell page ({@code index.html}) every Mateu mount serves — the single
 * implementation behind the generated index controllers of EVERY adapter (MVC, WebFlux, Micronaut,
 * Quarkus, Helidon MP), the YAML-mount routes and the static bundle writer.
 *
 * <p>It used to be copied into each adapter's {@code index.ftl}, and the copies had drifted: only
 * MVC promoted the boot scripts a Visual Builder (redwood) page parks as {@code
 * text/mateu-deferred}, so the same jar booted on MVC and showed a blank page everywhere else;
 * Quarkus ignored the page title; the Keycloak bootstrap of three adapters loaded the default
 * (ES-module) {@code keycloak-js} as a classic script. One implementation keeps the adapters equal
 * by construction.
 *
 * <p>The frontend artifact's {@code _index.html} carries markers this fills in: {@code
 * AQUIELTITULODELAPAGINA} (title), {@code <!-- AQUIFAVICON -->}, {@code <!-- AQUIKEYCLOAK -->},
 * {@code <!-- AQUIJS -->…<!-- HASTAAQUIJS -->} (the page's own boot) and {@code <!-- AQUIUI
 * -->…<!-- HASTAAQUIUI -->} (the root element).
 */
public final class IndexPage {

  private IndexPage() {}

  /** Keycloak SSO settings of a {@code @KeycloakSecured} UI. */
  public record Keycloak(String url, String realm, String clientId, String jsUrl) {}

  /**
   * What a mount's page is built from.
   *
   * @param path the mount's base path ({@code ""} for the root mount)
   * @param title the page title
   * @param favicon markup for the favicon marker (may be empty)
   * @param externalScripts module scripts to load before the title
   * @param keycloak Keycloak settings, or null for an unsecured UI
   * @param extraHead markup appended to {@code <head>}
   *     ({@code @Meta}/{@code @Link}/{@code @Script}), may be empty
   * @param debug whether {@code <mateu-ui>} gets {@code debug="true"}
   */
  public record Spec(
      String path,
      String title,
      String favicon,
      List<String> externalScripts,
      Keycloak keycloak,
      String extraHead,
      boolean debug) {

    public Spec {
      path = path == null ? "" : path;
      title = title == null ? "Mateu" : title;
      favicon = favicon == null ? "" : favicon;
      externalScripts = externalScripts == null ? List.of() : List.copyOf(externalScripts);
      extraHead = extraHead == null ? "" : extraHead;
    }

    public static Spec of(String path, String title) {
      return new Spec(path, title, "", List.of(), null, "", false);
    }

    public Spec withDebug(boolean debug) {
      return new Spec(path, title, favicon, externalScripts, keycloak, extraHead, debug);
    }
  }

  /** Reads {@code indexHtmlPath} off the classpath (relative to {@code anchor}) and renders it. */
  public static String render(Class<?> anchor, String indexHtmlPath, Spec spec) {
    // Where the served renderer is resolved: warn (once) when it is not the project's declared one.
    ProjectRendererCheck.warnOnce(Thread.currentThread().getContextClassLoader());
    return render(InputStreamReader.readFromClasspath(anchor, indexHtmlPath), spec);
  }

  /** Renders the given {@code _index.html} template for a mount. */
  public static String render(String html, Spec spec) {
    for (String script : spec.externalScripts()) {
      html =
          html.replace(
              "<title>AQUIELTITULODELAPAGINA</title>",
              "<script type='module' src='"
                  + script
                  + "'></script><title>AQUIELTITULODELAPAGINA</title>");
    }
    // replace, never replaceAll: the title is authored text and a "$" in it ("Costs in $") is a
    // group reference to replaceAll — an IllegalArgumentException, i.e. a 500 on every page load.
    html = html.replace("<!-- AQUIFAVICON -->", spec.favicon());
    html = html.replace("AQUIELTITULODELAPAGINA", spec.title());
    if (spec.keycloak() != null) {
      html = secured(html, spec);
    } else {
      html = mountUi(html, spec.path(), spec.debug());
    }
    if (!spec.extraHead().isEmpty()) {
      html = html.replace("</head>", spec.extraHead() + "</head>");
    }
    return devHead(html);
  }

  /** The meta tag a dev-mode page carries: where the live-reload events are. */
  public static final String DEV_META =
      "<meta name=\"mateu-dev\" content=\""
          + io.mateu.core.infra.dev.DevEndpoint.EVENTS_PATH
          + "\">";

  /**
   * In development mode ({@link io.mateu.core.infra.dev.DevMode}) the page announces the
   * live-reload event stream with a {@code <meta name="mateu-dev">}, so every renderer subscribes
   * to it; outside dev mode the page is untouched.
   */
  public static String devHead(String html) {
    if (!io.mateu.core.infra.dev.DevMode.enabled() || html.contains("name=\"mateu-dev\"")) {
      return html;
    }
    return html.replace("</head>", DEV_META + "</head>");
  }

  /**
   * Replaces the {@code <!-- AQUIUI -->…<!-- HASTAAQUIUI -->} region with a {@code <mateu-ui>} root
   * aimed at {@code path}, followed by the {@link #DEFERRED_BOOT deferred-boot replayer}. A page
   * without the markers is returned unchanged.
   */
  public static String mountUi(String html, String path, boolean debug) {
    return mountUi(
        html,
        "<mateu-ui baseUrl=\""
            + attr(path)
            + "\" pathPrefix=\""
            + attr(path)
            + "\""
            + (debug ? " debug=\"true\"" : "")
            + " style=\"width:100%;height:100vh;\"></mateu-ui>");
  }

  /**
   * Replaces the UI marker region with {@code rootElement} (any markup) followed by the deferred
   * boot replayer. Used by the static bundle writer, whose root carries a {@code bundleUrl}.
   */
  public static String mountUi(String html, String rootElement) {
    int from = html.indexOf("<!-- AQUIUI -->");
    int to = html.indexOf("<!-- HASTAAQUIUI -->");
    if (from < 0 || to < from) {
      return html;
    }
    return html.substring(0, from) + rootElement + DEFERRED_BOOT + html.substring(to);
  }

  /**
   * The script that boots a page which does not start itself with a single ES module — a Visual
   * Builder (redwood) application. Such a page parks its boot scripts as {@code
   * type="text/mateu-deferred"} (require.js, its bundle config, the visual-runtime) so no browser
   * runs them, and keeps their {@code src} in {@code data-src} so they are not even fetched. They
   * are promoted here IN ORDER, awaiting each (they depend on one another).
   *
   * <p>If one of them cannot be loaded — the Oracle CDN is unreachable, blocked by a proxy or a CSP
   * — the page would otherwise stay blank forever; instead it shows a plain explanation with a
   * retry link. A Vite-built renderer (vaadin) has no deferred scripts, so this is a no-op there.
   */
  public static final String DEFERRED_BOOT =
      "<script>(function(){var all=document.getElementsByTagName('script'),d=[];"
          + "for(var j=0;j<all.length;j++){if(all[j].type==='text/mateu-deferred')d.push(all[j]);}"
          + "if(!d.length)return;"
          + "function fail(u){console.log('mateu: deferred boot failed',u);"
          + "if(document.getElementById('mateu-boot-failed'))return;"
          + "var f=document.createElement('div');f.id='mateu-boot-failed';f.setAttribute('role','alert');"
          + "f.setAttribute('style','font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;max-width:40rem;margin:15vh auto;padding:1.5rem;line-height:1.5;color:#1a1a1a;background:#fff;border:1px solid #ddd;border-radius:8px;');"
          + "f.innerHTML='<h1 style=\"font-size:1.4rem;margin:0 0 .5rem\">The application could not start</h1>'"
          + "+'<p>A script it needs could not be loaded:</p><p><code style=\"word-break:break-all\"></code></p>'"
          + "+'<p>Check your network connection, or whether a proxy or a content security policy blocks it.</p>'"
          + "+'<p><a href=\"\">Try again</a></p>';"
          + "f.querySelector('code').textContent=u;"
          + "f.querySelector('a').addEventListener('click',function(e){e.preventDefault();location.reload();});"
          + "document.body.appendChild(f);}"
          + "var i=0;(function n(){if(i>=d.length)return;var o=d[i++],s=document.createElement('script');"
          + "for(var k=0;k<o.attributes.length;k++){var a=o.attributes[k];"
          + "if(a.name==='type'||a.name==='data-src')continue;s.setAttribute(a.name,a.value);}"
          + "var u=o.getAttribute('data-src');"
          + "if(u){s.onload=n;s.onerror=function(){fail(u);};s.src=u;}else{s.text=o.textContent;}"
          + "o.parentNode.replaceChild(s,o);if(!u)n();})();})();</script>";

  private static final String MODULE_SCRIPT_PREFIX = "<script type=\"module\" crossorigin src=\"";

  private static String secured(String html, Spec spec) {
    var keycloak = spec.keycloak();
    String path = js(spec.path());
    // The module this page boots itself with, read off the page rather than assumed.
    String mateuBundle = null;
    int moduleAt = html.indexOf(MODULE_SCRIPT_PREFIX);
    if (moduleAt >= 0) {
      int from = moduleAt + MODULE_SCRIPT_PREFIX.length();
      int to = html.indexOf('"', from);
      if (to > from) {
        mateuBundle = html.substring(from, to);
      }
    }
    // A page that boots Mateu itself (a module + a <mateu-ui> root) has that boot DISABLED here and
    // re-created after authentication, so the UI never starts without a token and never loads
    // twice. A page that boots some other way (Visual Builder) keeps its scripts parked as
    // text/mateu-deferred and they are promoted after authentication.
    boolean bootsItself =
        mateuBundle != null
            && html.contains("<!-- AQUIJS -->")
            && html.contains("<!-- HASTAAQUIJS -->")
            && html.contains("<!-- AQUIUI -->")
            && html.contains("<!-- HASTAAQUIUI -->");
    // A page with nowhere to put the Keycloak script is REFUSED: serving it anyway would publish an
    // unauthenticated console that looks like it loaded.
    if (!html.contains("<!-- AQUIKEYCLOAK -->")) {
      throw new IllegalStateException(
          "This UI is @KeycloakSecured, but the Mateu frontend artifact on the classpath ships an"
              + " _index.html with no <!-- AQUIKEYCLOAK --> marker, so there is nowhere to put the"
              + " script that acquires the token. Serving the page anyway would publish an"
              + " unauthenticated console, so it is refused instead.");
    }
    String script =
        KEYCLOAK_SCRIPT
            .replace("__KEYCLOAK_JS__", js(keycloak.jsUrl()))
            .replace("__KEYCLOAK_URL__", js(keycloak.url()))
            .replace("__KEYCLOAK_REALM__", js(keycloak.realm()))
            .replace("__KEYCLOAK_CLIENT__", js(keycloak.clientId()))
            .replace("__MATEU_PATH__", path)
            .replace("__MATEU_BUNDLE__", bootsItself ? js(mateuBundle) : "");
    html = html.replace("<!-- AQUIKEYCLOAK -->", script);
    if (bootsItself) {
      html =
          html.substring(0, html.indexOf("<!-- AQUIUI -->"))
              + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
      html =
          html.substring(0, html.indexOf("<!-- AQUIJS -->"))
              + "<link rel=\"modulepreload\" href=\""
              + mateuBundle
              + "\" />"
              + html.substring(html.indexOf("<!-- HASTAAQUIJS -->"));
      html =
          html.replaceAll(
              Pattern.quote(MODULE_SCRIPT_PREFIX + mateuBundle + "\"></script>"),
              Matcher.quoteReplacement(""));
    }
    return html;
  }

  private static final String KEYCLOAK_SCRIPT =
      """
      <script type="module">
          import Keycloak from '__KEYCLOAK_JS__';
          if ('__MATEU_BUNDLE__') {
              const mateuScript = document.createElement('link');
              mateuScript.rel = 'modulepreload';
              mateuScript.href = '__MATEU_BUNDLE__';
              document.head.appendChild(mateuScript);
          }
          async function bootDeferred(nodes) {
              for (const old of nodes) {
                  const s = document.createElement('script');
                  for (const a of Array.from(old.attributes)) {
                      if (a.name === 'type' || a.name === 'data-src') continue;
                      s.setAttribute(a.name, a.value);
                  }
                  const src = old.getAttribute('data-src');
                  const done = src
                      ? new Promise((ok, ko) => { s.onload = ok; s.onerror = () => ko(new Error(src)); })
                      : Promise.resolve();
                  if (src) s.src = src; else s.text = old.textContent;
                  old.parentNode.replaceChild(s, old);
                  await done;
              }
          }
          const keycloak = new Keycloak({
              url: '__KEYCLOAK_URL__',
              realm: '__KEYCLOAK_REALM__',
              clientId: '__KEYCLOAK_CLIENT__'
          });
          function storeToken() {
              localStorage.setItem('__mateu_auth_token', keycloak.token);
              localStorage.setItem('__mateu_auth_subject', keycloak.subject);
          }
          function refreshToken(minValidity) {
              return keycloak.updateToken(minValidity).then(function (refreshed) {
                  if (refreshed) {
                      storeToken();
                  }
                  return refreshed;
              }).catch(function (e) {
                  console.log('failed to refresh the token, or the session has expired', e);
                  keycloak.login();
                  throw e;
              });
          }
          keycloak.onTokenExpired = function () {
              refreshToken(30).catch(function () {});
          }
          document.addEventListener('visibilitychange', function () {
              if (document.visibilityState === 'visible' && keycloak.authenticated) {
                  refreshToken(30).catch(function () {});
              }
          });
          document.addEventListener('mateu-session-expired', function (e) {
              e.preventDefault();
              refreshToken(-1).then(function () {
                  e.detail.retry();
              }, function () {
                  e.detail.giveUp();
              });
          });
          keycloak.init({
              onLoad: 'login-required',
          }).then(function(authenticated) {
              console.log(authenticated ? 'authenticated' : 'not authenticated');
              if (authenticated) {
                  storeToken();
                  const deferred = Array.from(
                      document.querySelectorAll('script[type="text/mateu-deferred"]'));
                  if (deferred.length) {
                      const u = document.createElement('mateu-ui');
                      u.setAttribute('baseUrl', '__MATEU_PATH__');
                      u.setAttribute('pathPrefix', '__MATEU_PATH__');
                      u.setAttribute('style', 'display:none;');
                      document.body.appendChild(u);
                      bootDeferred(deferred).catch(function (e) {
                          console.log('failed to boot the deferred scripts', e);
                      });
                  } else {
                      const s = document.createElement('script');
                      s.setAttribute('type', 'module')
                      s.setAttribute('src', '__MATEU_BUNDLE__')
                      document.head.appendChild(s);
                      const u = document.createElement('mateu-ui');
                      u.setAttribute('baseUrl', '__MATEU_PATH__');
                      u.setAttribute('pathPrefix', '__MATEU_PATH__');
                      u.setAttribute('style', 'width:100%;height:100vh;');
                      document.body.appendChild(u);
                  }
              }
          }).catch(function(e) {
              console.log('failed to initialize', e);
          });
          async function logout() {
              localStorage.removeItem('__mateu_auth_token');
              localStorage.removeItem('__mateu_auth_subject');
              keycloak.logout({
                  redirectUri: window.location.origin,
                  post_logout_redirect_uri: '__MATEU_PATH__'
              });
          }
          window.logout = logout;
      </script>
      """;

  private static String attr(String value) {
    return value == null ? "" : value.replace("&", "&amp;").replace("\"", "&quot;");
  }

  private static String js(String value) {
    return value == null ? "" : value.replace("\\", "\\\\").replace("'", "\\'");
  }
}
