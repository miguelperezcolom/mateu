package io.mateu.core.infra;

import io.mateu.core.application.runaction.MountRegistry;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The renderer jars ship two pages: {@code static/_index.html}, the TEMPLATE a Mateu backend fills
 * per request ({@link IndexPage}), and {@code static/index.html}, the same page with no backend to
 * fill it, made to be uploaded to a CDN or a static host as it is (it names its backend in {@code
 * <meta name="mateu-backend">}).
 *
 * <p>A backend must never serve that second page: it would boot a UI aimed at the root mount. But a
 * file called {@code static/index.html} is exactly what Spring Boot serves as its welcome page at
 * {@code /} (MVC and WebFlux) when no Mateu UI sits at the root, and as a plain file at {@code
 * /index.html}, where an app answered 404 (or its root UI) before the file existed. The Spring
 * adapters ask {@link #hidden} and answer 404 then, so nothing changes for an app; an app's OWN
 * {@code static/index.html} (first on the classpath) is never hidden.
 */
public final class DeployablePage {

  private DeployablePage() {}

  /** The marker of the deployable page (scripts/static-site-page.mjs writes it, once). */
  public static final String MARKER = "<meta name=\"mateu-backend\"";

  private static final Map<ClassLoader, Boolean> SHADOWS = new ConcurrentHashMap<>();
  private static final Map<ClassLoader, Boolean> YAML_ROOTS = new ConcurrentHashMap<>();

  /** True when {@code html} is a renderer jar's deployable page. */
  public static boolean isDeployablePage(String html) {
    return html != null && html.contains(MARKER);
  }

  /**
   * True when the {@code static/index.html} the classpath resolves first (the one Spring Boot would
   * serve) is a renderer jar's deployable page. Read once per class loader.
   */
  public static boolean servedFromTheClasspath(ClassLoader classLoader) {
    var cl = classLoader != null ? classLoader : DeployablePage.class.getClassLoader();
    return SHADOWS.computeIfAbsent(
        cl,
        key -> {
          try (InputStream in = key.getResourceAsStream("static/index.html")) {
            return in != null
                && isDeployablePage(new String(in.readAllBytes(), StandardCharsets.UTF_8));
          } catch (IOException e) {
            return false;
          }
        });
  }

  /**
   * True when a GET of {@code path} (below the app's context path) would be answered with the
   * deployable page and must be a 404 instead — when the classpath's {@code static/index.html} is
   * the renderer's: always for {@code /index.html} (the file), and for {@code /} when no Mateu UI
   * sits at the root (no {@code @UI("")} among {@code classBaseUrls}, no YAML mount at {@code ""}).
   */
  public static boolean hidden(
      String path, Collection<String> classBaseUrls, ClassLoader classLoader) {
    return hidden(path, classBaseUrls, classLoader, false);
  }

  /**
   * As {@link #hidden(String, Collection, ClassLoader)}, for an adapter whose root UI answers
   * {@code /index.html} itself (WebFlux: the generated index's first route takes any one segment):
   * there the file is only reached, and hidden, when no UI sits at the root.
   */
  public static boolean hidden(
      String path,
      Collection<String> classBaseUrls,
      ClassLoader classLoader,
      boolean rootUiAnswersTheFile) {
    if ("/index.html".equals(path)) {
      if (rootUiAnswersTheFile && rootIsServed(classBaseUrls, classLoader)) {
        return false;
      }
      // the FILE: never a backend's page
      return servedFromTheClasspath(classLoader);
    }
    if (!"/".equals(path) || rootIsServed(classBaseUrls, classLoader)) {
      return false;
    }
    return servedFromTheClasspath(classLoader);
  }

  private static boolean rootIsServed(Collection<String> classBaseUrls, ClassLoader classLoader) {
    if (classBaseUrls != null) {
      for (String baseUrl : classBaseUrls) {
        if (baseUrl == null || baseUrl.isEmpty() || "/".equals(baseUrl)) {
          return true;
        }
      }
    }
    var cl = classLoader != null ? classLoader : DeployablePage.class.getClassLoader();
    return YAML_ROOTS.computeIfAbsent(
        cl,
        key ->
            new MountRegistry()
                .mounts(key).stream()
                    .map(MountRegistry.Mount::basePath)
                    .anyMatch(base -> base == null || base.isEmpty() || "/".equals(base)));
  }
}
