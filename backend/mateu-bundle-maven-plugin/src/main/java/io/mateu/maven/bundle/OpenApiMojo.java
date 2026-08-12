package io.mateu.maven.bundle;

import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.core.application.openapi.OpenApiEmitter;
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

  @Override
  public void execute() throws MojoExecutionException {
    var previous = Thread.currentThread().getContextClassLoader();
    try (var loader = appClassLoader()) {
      Thread.currentThread().setContextClassLoader(loader);

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

      var document = OpenApiEmitter.emit(title == null ? "API" : title, views);
      var paths = document.get("paths").size();
      if (failOnEmpty && paths == 0) {
        throw new MojoExecutionException(
            "mateu-openapi: no screen declares an endpoint — nothing to derive");
      }

      Files.createDirectories(outputFile.toPath().getParent());
      Files.writeString(outputFile.toPath(), OpenApiEmitter.emitJson(title, views) + "\n");
      getLog()
          .info(
              "mateu-openapi: "
                  + paths
                  + " path(s) derived from "
                  + views.size()
                  + " screen(s) → "
                  + outputFile);
    } catch (MojoExecutionException e) {
      throw e;
    } catch (Exception e) {
      throw new MojoExecutionException("mateu-openapi failed", e);
    } finally {
      Thread.currentThread().setContextClassLoader(previous);
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
