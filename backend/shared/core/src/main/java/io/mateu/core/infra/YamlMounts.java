package io.mateu.core.infra;

import io.mateu.core.application.runaction.MountRegistry;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.dtos.RunActionRqDto;
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
   * The mobile app's manifest ({@link MobileManifest}) of the mount at {@code basePath}, from its
   * app shell definition — served at {@code <apiPrefix>/v3/manifest}.
   */
  public static String manifestJson(
      RouteRegistry routeRegistry, YamlAppLoader appLoader, String basePath) {
    var definition = routeRegistry.rootDefinitionFor(basePath == null ? "" : basePath);
    return MobileManifest.json(appLoader.load(definition));
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
    // A nested mount's API lives at its ABSOLUTE path (/back-office/mateu/v3/…). A bare
    // "back-office" is resolved by the browser against the page, so /back-office/x posted to
    // /back-office/back-office/mateu/… and every page of a nested YAML mount answered 404. The
    // route stays the whole browser path (pathPrefix ""): a YAML mount's routes are matched with
    // the mount on them.
    return IndexPage.devHead(
        IndexPage.mountUi(
            html,
            "<mateu-ui baseUrl=\""
                + uiPath(basePath)
                + "\" pathPrefix=\"\" style=\"width:100%;height:100vh;\"></mateu-ui>"));
  }

  /** The {@code baseUrl} of a mount's {@code <mateu-ui>}: "" or "/back-office". */
  static String uiPath(String basePath) {
    return basePath == null || basePath.isEmpty() ? "" : "/" + basePath;
  }

  /**
   * The request a mount's sync endpoint hands to the service. The client sends the route RELATIVE
   * to the {@code baseUrl} it posts to (it strips it from the browser path, as for a pathed
   * {@code @UI} page), while a YAML mount's routes are registered WITH the mount on them ({@code
   * orders/list}): without this, every route of a nested mount was "Page not found". A route that
   * already names the mount (one the server sent back itself) is left as it is.
   */
  public static RunActionRqDto mountRequest(String basePath, RunActionRqDto rq) {
    if (rq == null || basePath == null || basePath.isEmpty()) {
      return rq;
    }
    var route = rq.route() == null ? "" : rq.route();
    var relative = route.startsWith("/") ? route.substring(1) : route;
    if (relative.equals(basePath) || relative.startsWith(basePath + "/")) {
      return rq;
    }
    var mounted = "/" + basePath + (relative.isEmpty() ? "" : "/" + relative);
    return new RunActionRqDto(
        rq.componentState(),
        rq.appState(),
        rq.parameters(),
        rq.initiatorComponentId(),
        rq.consumedRoute(),
        rq.actionId(),
        mounted,
        rq.serverSideType(),
        rq.serverSideComponentRoute(),
        rq.knownStructureHash());
  }
}
