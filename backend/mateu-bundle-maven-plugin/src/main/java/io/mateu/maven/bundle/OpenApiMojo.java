package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.core.application.openapi.OpenApiEmitter;
import io.mateu.core.application.runaction.RestSourceRegistry;
import io.mateu.uidl.data.RestSourceCatalog;
import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.apache.maven.project.MavenProject;

/**
 * Writes the OpenAPI the app's screens imply.
 *
 * <p>The contract was always there — every {@code @RestOptions}, {@code @RestListing},
 * {@code @RestData} and {@code @RestAction} states a URL, a method, the parameters it interpolates
 * and the shape it reads back. This goal is what makes it a file somebody can open, review, hand to
 * the team writing the API, or feed to {@code ApiContractCheck}.
 *
 * <p>It is a <b>lower bound</b>, and the emitted document says so about itself: paths, methods,
 * parameters and the field each screen reads. Not error codes, not authentication, not business
 * rules.
 */
@Mojo(
    name = "openapi",
    defaultPhase = LifecyclePhase.PREPARE_PACKAGE,
    requiresDependencyResolution = ResolutionScope.RUNTIME,
    threadSafe = true)
public class OpenApiMojo extends AbstractMojo {

  @Parameter(defaultValue = "${project}", readonly = true, required = true)
  private MavenProject project;

  @Parameter(
      property = "mateu.openapi.outputFile",
      defaultValue = "${project.build.directory}/mateu-openapi.json")
  private File outputFile;

  /** The {@code info.title} of the emitted document. */
  @Parameter(property = "mateu.openapi.title", defaultValue = "${project.name}")
  private String title;

  /** Fail the build when no screen declares any endpoint (usually a misconfiguration). */
  @Parameter(property = "mateu.openapi.failOnEmpty", defaultValue = "false")
  private boolean failOnEmpty;

  /**
   * Where to read the declarations from: {@code classes} (the {@code @Rest*} annotations), {@code
   * bundle} (the wire JSON of an exported static bundle) or {@code both} (the default).
   *
   * <p>{@code bundle} is what makes this work for a mount authored as DATA: a screen declared in
   * YAML has no annotated class to reflect over, and everything it declares still reaches the wire.
   * The named source catalogue is always read — it is the richest channel and needs neither.
   */
  @Parameter(property = "mateu.openapi.from", defaultValue = "both")
  private String from;

  /** The exported bundle to read wire JSON from, when {@code from} includes the bundle. */
  @Parameter(
      property = "mateu.openapi.manifestFile",
      defaultValue = "${project.build.directory}/mateu-bundle/manifest.json")
  private File manifestFile;

  @Override
  public void execute() throws MojoExecutionException {
    var previous = Thread.currentThread().getContextClassLoader();
    try (var loader = appClassLoader()) {
      Thread.currentThread().setContextClassLoader(loader);

      var mode = from == null || from.isBlank() ? "both" : from.trim().toLowerCase();
      var views = readsClasses(mode) ? views(loader) : new ArrayList<Class<?>>();
      var wire = readsBundle(mode) ? wireDocuments() : List.<String>of();
      var catalogue = catalogue();

      var declarations = new OpenApiEmitter.Declarations(views, wire, catalogue);
      var document = OpenApiEmitter.emit(title == null ? "API" : title, declarations);
      var paths = document.get("paths").size();
      if (failOnEmpty && paths == 0) {
        throw new MojoExecutionException(
            "mateu-openapi: nothing declares an endpoint — nothing to derive");
      }

      Files.createDirectories(outputFile.toPath().getParent());
      Files.writeString(outputFile.toPath(), OpenApiEmitter.emitJson(title, declarations) + "\n");
      getLog()
          .info(
              "mateu-openapi: "
                  + paths
                  + " path(s) derived from "
                  + catalogue.sources().size()
                  + " named source(s), "
                  + views.size()
                  + " screen(s) and "
                  + wire.size()
                  + " bundled route(s) → "
                  + outputFile);
      getLog()
          .info(
              "mateu-openapi: "
                  + catalogue.toImplement().size()
                  + " source(s) to implement, "
                  + catalogue.consumed().size()
                  + " already served elsewhere");
    } catch (MojoExecutionException e) {
      throw e;
    } catch (Exception e) {
      throw new MojoExecutionException("mateu-openapi failed", e);
    } finally {
      Thread.currentThread().setContextClassLoader(previous);
    }
  }

  private static boolean readsClasses(String mode) {
    return "classes".equals(mode) || "both".equals(mode);
  }

  private static boolean readsBundle(String mode) {
    return "bundle".equals(mode) || "both".equals(mode);
  }

  private List<Class<?>> views(URLClassLoader loader) {
    var views = new ArrayList<Class<?>>();
    for (var ref : RouteRegistrations.read(loader)) {
      try {
        views.add(Class.forName(ref.className(), false, loader));
      } catch (Throwable t) {
        // A view we cannot load contributes nothing; the bundle goal reports the same class of
        // problem, so failing here would just be a second, noisier voice.
        getLog().debug("mateu-openapi: skipping " + ref.className() + " (" + t + ")");
      }
    }
    return views;
  }

  /**
   * The wire JSON of every route in an exported bundle.
   *
   * <p>A missing manifest is not an error: {@code both} is the default, and an app that never runs
   * {@code mateu:bundle} should still get its contract derived from the other channels.
   */
  private List<String> wireDocuments() {
    if (manifestFile == null || !manifestFile.isFile()) {
      getLog()
          .debug(
              "mateu-openapi: no bundle manifest at "
                  + manifestFile
                  + " — deriving from the other channels only");
      return List.of();
    }
    try {
      var manifest = new ObjectMapper().readTree(manifestFile);
      var entries = manifest.get("entries");
      if (entries == null || !entries.isArray()) {
        return List.of();
      }
      var documents = new ArrayList<String>();
      for (var entry : entries) {
        if (entry.hasNonNull("json")) {
          documents.add(entry.get("json").asText());
        }
      }
      return documents;
    } catch (Exception e) {
      getLog().warn("mateu-openapi: could not read " + manifestFile + " (" + e + ")");
      return List.of();
    }
  }

  /** The named source catalogue, read the same way the running app reads it. */
  private RestSourceCatalog catalogue() {
    try {
      return new RestSourceRegistry().catalog();
    } catch (Throwable t) {
      getLog().warn("mateu-openapi: could not read the source catalogue (" + t + ")");
      return RestSourceCatalog.empty();
    }
  }

  /** The app's runtime classpath, so its {@code @UI} classes are loadable. */
  private URLClassLoader appClassLoader() throws Exception {
    List<String> elements = project.getRuntimeClasspathElements();
    var urls = new ArrayList<URL>();
    for (var element : elements) {
      urls.add(new File(element).toURI().toURL());
    }
    return new URLClassLoader(urls.toArray(new URL[0]), getClass().getClassLoader());
  }
}
