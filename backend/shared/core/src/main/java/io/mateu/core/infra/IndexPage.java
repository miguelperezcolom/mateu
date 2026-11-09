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
 * Quarkus ignored the page title. One implementation keeps the adapters equal by construction.
 *
 * <p>The frontend artifact's {@code _index.html} carries markers this fills in: {@code
 * AQUIELTITULODELAPAGINA} (title), {@code <!-- AQUIFAVICON -->}, {@code <!-- AQUIJS -->…<!--
 * HASTAAQUIJS -->} (the page's own boot) and {@code <!-- AQUIUI -->…<!-- HASTAAQUIUI -->} (the root
 * element).
 */
public final class IndexPage {

  private IndexPage() {}

  /**
   * What a mount's page is built from.
   *
   * @param path the mount's base path ({@code ""} for the root mount)
   * @param title the page title
   * @param favicon markup for the favicon marker (may be empty)
   * @param externalScripts module scripts to load before the title
   * @param extraHead markup appended to {@code <head>}
   *     ({@code @Meta}/{@code @Link}/{@code @Script}), may be empty
   * @param debug whether {@code <mateu-ui>} gets {@code debug="true"}
   * @param uiId the fully-qualified name of the {@code @UI} class, whose declarations (theme
   *     colour, icon) the installable-app head ({@link Pwa}) reads; null when there is none
   */
  public record Spec(
      String path,
      String title,
      String favicon,
      List<String> externalScripts,
      String extraHead,
      boolean debug,
      String uiId) {

    public Spec {
      path = path == null ? "" : path;
      title = title == null ? "Mateu" : title;
      favicon = favicon == null ? "" : favicon;
      externalScripts = externalScripts == null ? List.of() : List.copyOf(externalScripts);
      extraHead = extraHead == null ? "" : extraHead;
    }

    public static Spec of(String path, String title) {
      return new Spec(path, title, "", List.of(), "", false, null);
    }

    public Spec withDebug(boolean debug) {
      return new Spec(path, title, favicon, externalScripts, extraHead, debug, uiId);
    }

    public Spec withUiId(String uiId) {
      return new Spec(path, title, favicon, externalScripts, extraHead, debug, uiId);
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
    html = html.replace("<!-- AQUIFAVICON -->", faviconOf(spec.favicon()));
    html = html.replace("AQUIELTITULODELAPAGINA", spec.title());
    html = mountUi(html, spec.path(), spec.debug());
    if (!spec.extraHead().isEmpty()) {
      html = html.replace("</head>", spec.extraHead() + "</head>");
    }
    // the installable-app head (manifest, theme colour, worker), last: it hashes the final page
    return devHead(
        Pwa.served(
            OracleCdn.apply(withoutMarkers(html)),
            spec.path(),
            spec.uiId() == null ? null : MobileManifest.sourceOf(spec.uiId())));
  }

  /**
   * The favicon a renderer page carries when the app names none (the browser tab shows Mateu's, not
   * a build tool's); the app's own favicon then arrives with the shell ({@code SetFavicon}). Served
   * by the renderer jar next to its assets, so it resolves on every adapter.
   */
  public static final String DEFAULT_FAVICON =
      "<link rel=\"icon\" type=\"image/svg+xml\" href=\"/assets/mateu-icon.svg\" />";

  /** The markup for the favicon marker: the given one, or {@link #DEFAULT_FAVICON}. */
  public static String faviconOf(String favicon) {
    return favicon == null || favicon.isBlank() ? DEFAULT_FAVICON : favicon;
  }

  /** The template markers this class fills in — none of them is left in a served page. */
  static final List<String> MARKERS =
      List.of(
          "<!-- AQUIFAVICON -->",
          // inert: nothing goes here any more, but the renderers' templates still carry it
          "<!-- AQUIKEYCLOAK -->",
          "<!-- AQUIJS -->",
          "<!-- HASTAAQUIJS -->",
          "<!-- AQUIUI -->",
          "<!-- HASTAAQUIUI -->");

  /**
   * {@code html} without the template's marker comments: they only mean something to this class,
   * and a served page showed them (in Spanish) in every app's view-source. Call it last — the
   * markers are where the page's parts go.
   */
  public static String withoutMarkers(String html) {
    for (String marker : MARKERS) {
      html = html.replace(marker, "");
    }
    return html;
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
   * boot replayer when the page parks scripts for it. Used by the static bundle writer, whose root
   * carries a {@code bundleUrl}.
   *
   * <p>The replayer is an inline script, so it is only added to a page that needs it (a Visual
   * Builder page, whose boot scripts are {@code text/mateu-deferred}): a Vite-built page then has
   * no inline script at all and runs under {@code script-src 'self'}.
   */
  public static String mountUi(String html, String rootElement) {
    int from = html.indexOf("<!-- AQUIUI -->");
    int to = html.indexOf("<!-- HASTAAQUIUI -->");
    if (from < 0 || to < from) {
      return html;
    }
    String boot = html.contains("text/mateu-deferred") ? DEFERRED_BOOT : "";
    return html.substring(0, from) + rootElement + boot + html.substring(to);
  }

  /**
   * The Content Security Policy sources ({@code 'sha256-…'}) of every inline {@code <script>} of a
   * rendered page, in order — what {@code script-src} has to allow besides {@code 'self'} for the
   * page to run without {@code 'unsafe-inline'}. A Vite-built page has none; a Visual Builder
   * page's boot does.
   */
  public static List<String> inlineScriptHashes(String html) {
    var hashes = new java.util.ArrayList<String>();
    Matcher m = INLINE_SCRIPT.matcher(html);
    while (m.find()) {
      if (m.group(1).matches("(?is).*\\bsrc\\s*=.*")) {
        continue;
      }
      try {
        byte[] digest =
            java.security.MessageDigest.getInstance("SHA-256")
                .digest(m.group(2).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        hashes.add("'sha256-" + java.util.Base64.getEncoder().encodeToString(digest) + "'");
      } catch (java.security.NoSuchAlgorithmException e) {
        throw new IllegalStateException(e);
      }
    }
    return hashes;
  }

  private static final Pattern INLINE_SCRIPT =
      Pattern.compile(
          "<script\\b([^>]*)>(.*?)</script>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);

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

  private static String attr(String value) {
    return value == null ? "" : value.replace("&", "&amp;").replace("\"", "&quot;");
  }
}
