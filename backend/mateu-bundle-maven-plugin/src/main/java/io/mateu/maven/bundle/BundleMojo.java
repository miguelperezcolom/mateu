package io.mateu.maven.bundle;

import io.mateu.core.application.export.MateuBundleExporter;
import io.mateu.core.application.export.RouteRegistrations;
import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.apache.maven.project.MavenProject;

/**
 * {@code mateu:bundle} — exports the app's declared screens to a STATIC BUNDLE so the Mateu UI can
 * be served from static hosting / a CDN with no (or optional) backend. For each static
 * {@code @UI}/{@code @Route} route it renders the initial load (the same JSON the server returns
 * for {@code actionId=""}) into {@code manifest.json}, copies the renderer assets and stamps a
 * static {@code index.html} that boots {@code <mateu-ui bundleUrl="./manifest.json">}. Route loads
 * are then answered from the bundle client-side; live data still comes from external endpoints, and
 * ACTIONS still need a backend.
 *
 * <p>Static routes only (param routes are skipped); a route whose load needs runtime-only resources
 * (live DB, unscannable bean) is logged + skipped, never failing the build.
 */
@Mojo(
    name = "bundle",
    defaultPhase = LifecyclePhase.PREPARE_PACKAGE,
    requiresDependencyResolution = ResolutionScope.RUNTIME,
    threadSafe = true)
public class BundleMojo extends AbstractMojo {

  @Parameter(defaultValue = "${project}", readonly = true, required = true)
  private MavenProject project;

  @Parameter(
      property = "mateu.bundle.outputDirectory",
      defaultValue = "${project.build.directory}/mateu-bundle")
  private File outputDirectory;

  /**
   * App base packages to component-scan for {@code @Service}/{@code @Component} beans the
   * ViewModels inject. Default: inferred from the declared {@code @UI}/{@code @Route} classes.
   */
  @Parameter(property = "mateu.bundle.basePackages")
  private List<String> basePackages;

  /** Stamped into {@code <mateu-ui baseUrl=…>} and the manifest; "" = same-origin static host. */
  @Parameter(property = "mateu.bundle.baseUrl", defaultValue = "")
  private String baseUrl;

  /** Optional allowlist of routes to export; default = all discovered static routes. */
  @Parameter(property = "mateu.bundle.routes")
  private List<String> routes;

  @Parameter(property = "mateu.bundle.skipParamRoutes", defaultValue = "true")
  private boolean skipParamRoutes;

  /**
   * Dir holding {@code _index.html} + {@code assets/}; default = the vaadin-lit static resources.
   */
  @Parameter(property = "mateu.bundle.assetsFrom")
  private String assetsFrom;

  @Parameter(property = "mateu.bundle.pageTitle", defaultValue = "Mateu")
  private String pageTitle;

  @Parameter(property = "mateu.bundle.failOnEmpty", defaultValue = "false")
  private boolean failOnEmpty;

  @Override
  public void execute() throws MojoExecutionException, MojoFailureException {
    var appLoader = buildAppLoader();
    var previous = Thread.currentThread().getContextClassLoader();
    Thread.currentThread().setContextClassLoader(appLoader);
    try {
      var discovered = RouteRegistrations.read(appLoader);
      getLog().info("mateu-bundle: discovered " + discovered.size() + " declared route(s)");

      var uiClasses = new ArrayList<Class<?>>();
      for (var e : discovered) {
        try {
          uiClasses.add(appLoader.loadClass(e.className()));
        } catch (Throwable t) {
          getLog().warn("mateu-bundle: cannot load " + e.className() + " (skipped): " + t);
        }
      }

      var toExport =
          discovered.stream()
              .map(RouteRegistrations.RouteRef::route)
              .filter(r -> !skipParamRoutes || !r.contains(":"))
              .filter(r -> routes == null || routes.isEmpty() || routes.contains(r))
              .distinct()
              .toList();

      var packages =
          (basePackages != null && !basePackages.isEmpty())
              ? basePackages
              : inferBasePackages(uiClasses);
      getLog().info("mateu-bundle: scanning app packages " + packages);

      try (var boot = new BootContext(appLoader, uiClasses, packages)) {
        var exporter = new MateuBundleExporter(boot.service);
        // With an explicit allowlist, export exactly those routes. Otherwise let the exporter
        // discover every route from the booted bean graph (RouteResolver + RoutedClassProvider) AND
        // the compiled index — so single-module apps (no index files) still bundle.
        // skipParamRoutes=false → bundle :param routes as TEMPLATES (rendered once with a
        // placeholder; the client matches concrete paths against them at runtime).
        var manifest =
            (routes != null && !routes.isEmpty())
                ? exporter.export(baseUrl, toExport)
                : exporter.exportAll(baseUrl, appLoader, true, !skipParamRoutes);

        BundleWriter.write(
            outputDirectory.toPath(), manifest, assetsFrom, appLoader, baseUrl, pageTitle);

        long ok = manifest.entries().stream().filter(MateuBundleExporter.BundleEntry::ok).count();
        manifest.entries().stream()
            .filter(e -> !e.ok())
            .forEach(
                e -> getLog().warn("mateu-bundle: skipped " + e.route() + " — " + e.skipReason()));
        getLog()
            .info(
                "mateu-bundle: "
                    + ok
                    + "/"
                    + manifest.entries().size()
                    + " route(s) rendered → "
                    + outputDirectory);
        if (failOnEmpty && ok == 0) {
          throw new MojoFailureException("mateu-bundle: no routes rendered");
        }
      }
    } catch (MojoFailureException e) {
      throw e;
    } catch (Exception e) {
      throw new MojoExecutionException("mateu-bundle failed", e);
    } finally {
      Thread.currentThread().setContextClassLoader(previous);
    }
  }

  /**
   * The app's runtime classpath as a child classloader whose parent is the plugin realm — so
   * framework classes (core/uidl/dtos/spring) resolve as a single copy from the plugin
   * (parent-first delegation), and only the app's own classes come from the child URLs.
   */
  private URLClassLoader buildAppLoader() throws MojoExecutionException {
    try {
      var urls = new ArrayList<URL>();
      for (String element : project.getRuntimeClasspathElements()) {
        urls.add(new File(element).toURI().toURL());
      }
      return new URLClassLoader(urls.toArray(URL[]::new), getClass().getClassLoader());
    } catch (Exception e) {
      throw new MojoExecutionException("Could not build the app classpath", e);
    }
  }

  /** Longest common package prefix of the UI classes (a reasonable @Service scan root). */
  private static List<String> inferBasePackages(List<Class<?>> uiClasses) {
    if (uiClasses.isEmpty()) {
      return List.of();
    }
    String prefix = uiClasses.get(0).getPackageName();
    for (Class<?> c : uiClasses) {
      prefix = commonPrefix(prefix, c.getPackageName());
    }
    // never scan an empty / single-segment root (too broad); fall back to each distinct package
    if (prefix.isBlank() || !prefix.contains(".")) {
      return uiClasses.stream().map(Class::getPackageName).distinct().toList();
    }
    return List.of(prefix);
  }

  private static String commonPrefix(String a, String b) {
    var as = a.split("\\.");
    var bs = b.split("\\.");
    var out = new ArrayList<String>();
    for (int i = 0; i < Math.min(as.length, bs.length); i++) {
      if (as[i].equals(bs[i])) {
        out.add(as[i]);
      } else {
        break;
      }
    }
    return String.join(".", out);
  }
}
