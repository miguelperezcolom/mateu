package io.mateu.core.infra;

import io.mateu.core.application.runaction.MountRegistry;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import java.util.ArrayList;
import java.util.List;

/**
 * The HTTP surface of a deployment whose UIs are defined entirely in YAML ({@code type: UI} files
 * under {@code specs/ui/**}) — an SPA shell and a sync endpoint per mount at its own base path —
 * expressed framework-neutrally so every adapter (MVC, WebFlux, Micronaut, Quarkus, Helidon MP)
 * serves it the same way. The annotation processor generates these per {@code @UI} class; a
 * class-less deployment has none, and the adapters register these routes instead.
 */
public final class YamlMounts {

  private YamlMounts() {}

  /**
   * One YAML-defined mount.
   *
   * @param basePath {@code ""} for a root mount, e.g. {@code "back-office"} otherwise (no slash)
   * @param title the page title, from the mount's app shell definition
   */
  public record Mount(String basePath, String title) {

    /** Where the SPA shell is served: {@code /} or {@code /back-office}. */
    public String spaPath() {
      return basePath.isEmpty() ? "/" : "/" + basePath;
    }

    /** The prefix of the mount's API: {@code /mateu} or {@code /back-office/mateu}. */
    public String apiPrefix() {
      return basePath.isEmpty() ? "/mateu" : "/" + basePath + "/mateu";
    }

    /** The SPA shell page. */
    public String indexHtml() {
      return YamlMounts.indexHtml(basePath, title);
    }
  }

  /**
   * True when the classpath declares at least one data-driven mount. Adapters use it to contribute
   * the routes only when there is a YAML UI to serve, never for an arbitrary app.
   */
  public static boolean present(ClassLoader classLoader) {
    return !new MountRegistry()
        .mounts(classLoader != null ? classLoader : YamlMounts.class.getClassLoader())
        .isEmpty();
  }

  /** The mounts to serve, with their titles resolved. */
  public static List<Mount> mounts(RouteRegistry routeRegistry, YamlAppLoader yamlAppLoader) {
    var mounts = new ArrayList<Mount>();
    for (var mount : routeRegistry.mounts()) {
      var basePath = mount.basePath() == null ? "" : mount.basePath();
      mounts.add(new Mount(basePath, titleOf(routeRegistry, yamlAppLoader, basePath)));
    }
    return mounts;
  }

  /**
   * The mount whose API a request path belongs to — the longest {@link Mount#apiPrefix()} the path
   * starts with — or null.
   */
  public static Mount mountForApiPath(List<Mount> mounts, String path) {
    Mount best = null;
    for (var mount : mounts) {
      var prefix = mount.apiPrefix() + "/";
      if (path.startsWith(prefix)
          && (best == null || mount.apiPrefix().length() > best.apiPrefix().length())) {
        best = mount;
      }
    }
    return best;
  }

  private static String titleOf(
      RouteRegistry routeRegistry, YamlAppLoader appLoader, String basePath) {
    var definition = routeRegistry.rootDefinitionFor(basePath);
    var shell = appLoader.load(definition);
    return shell != null && shell.title() != null ? shell.title() : "Mateu";
  }

  /**
   * The SPA shell HTML with a {@code <mateu-ui baseUrl="{basePath}">} injected; the SPA then POSTs
   * {@code /{basePath}/mateu/v3/**} and the YAML-defined mount answers.
   */
  public static String indexHtml(String basePath, String title) {
    ProjectRendererCheck.warnOnce(Thread.currentThread().getContextClassLoader());
    String html = InputStreamReader.readFromClasspath(YamlMounts.class, "/static/_index.html");
    html = html.replace("<!-- AQUIFAVICON -->", "");
    // replace, not replaceAll: the title is authored text, and a "$" in it ("Costs in $") is a
    // group reference to replaceAll — IllegalArgumentException, a 500 on every page load.
    html = html.replace("AQUIELTITULODELAPAGINA", title);
    return IndexPage.mountUi(
        html,
        "<mateu-ui baseUrl=\""
            + basePath
            + "\" pathPrefix=\"\" style=\"width:100%;height:100vh;\"></mateu-ui>");
  }
}
