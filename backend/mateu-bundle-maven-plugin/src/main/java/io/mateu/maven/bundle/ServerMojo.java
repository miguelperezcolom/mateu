package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.openapi.ServerSkeleton;
import java.io.File;
import java.nio.file.Files;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.project.MavenProject;

/**
 * {@code mateu:server} — generates a Spring Boot module implementing the endpoints the derived
 * contract says this project owes.
 *
 * <p>The last step of the path the static bundle opens: draw the screens, run them with no backend
 * against real endpoints, derive the contract they imply, and land on real Java. Nothing about the
 * result is locked in — it is an ordinary Maven module with ordinary Spring controllers.
 *
 * <p>It reads an OpenAPI FILE rather than the declarations directly, so the two goals compose and
 * so this one also works on a hand-written or third-party document. Run {@code mateu:openapi}
 * first, or point {@code openApiFile} at whatever document you want a server for.
 *
 * <p>What it writes is generated in full and rewritten every run: a controller and a port per
 * group, the response records, a runnable application. What it never writes is the adapter — that
 * is yours, in a file this goal cannot touch. Regenerating is therefore always safe, which is the
 * only way a generator stays honest over time (see {@link ServerSkeleton}).
 */
@Mojo(name = "server", defaultPhase = LifecyclePhase.GENERATE_SOURCES, threadSafe = true)
public class ServerMojo extends AbstractMojo {

  @Parameter(defaultValue = "${project}", readonly = true, required = true)
  private MavenProject project;

  /** The contract to implement. Defaults to what {@code mateu:openapi} writes. */
  @Parameter(
      property = "mateu.server.openApiFile",
      defaultValue = "${project.build.directory}/mateu-openapi.json")
  private File openApiFile;

  /**
   * Where the module is written. Defaults inside {@code target/} so a run can never surprise
   * anybody by writing into the source tree; point it at a real module path when you want to keep
   * it.
   */
  @Parameter(
      property = "mateu.server.outputDirectory",
      defaultValue = "${project.build.directory}/mateu-server")
  private File outputDirectory;

  @Parameter(property = "mateu.server.groupId", defaultValue = "${project.groupId}")
  private String groupId;

  @Parameter(property = "mateu.server.artifactId", defaultValue = "${project.artifactId}-api")
  private String artifactId;

  @Parameter(property = "mateu.server.version", defaultValue = "${project.version}")
  private String version;

  /** The generated module's base package. Defaults to {@code <groupId>.<artifactId>}. */
  @Parameter(property = "mateu.server.basePackage")
  private String basePackage;

  @Parameter(property = "mateu.server.springBootVersion", defaultValue = "3.3.4")
  private String springBootVersion;

  @Parameter(property = "mateu.server.javaVersion", defaultValue = "21")
  private String javaVersion;

  /**
   * Which operations to implement: {@code generate} (the default — only the endpoints this project
   * owes), {@code existing}, or {@code all}.
   *
   * <p>The default is what keeps the output sane: generating a controller for a third party's API
   * would be nonsense, and the source catalogue's {@code provenance} is what makes the distinction
   * available instead of guessed.
   */
  @Parameter(property = "mateu.server.provenance", defaultValue = "generate")
  private String provenance;

  /** Fail the build when the contract asks for nothing (usually a misconfiguration). */
  @Parameter(property = "mateu.server.failOnEmpty", defaultValue = "false")
  private boolean failOnEmpty;

  @Override
  public void execute() throws MojoExecutionException {
    try {
      if (openApiFile == null || !openApiFile.isFile()) {
        throw new MojoExecutionException(
            "mateu-server: no OpenAPI at "
                + openApiFile
                + " — run mateu:openapi first, or set mateu.server.openApiFile");
      }
      var document = new ObjectMapper().readTree(openApiFile);
      var options =
          new ServerSkeleton.Options(
              groupId,
              artifactId,
              version,
              basePackage,
              springBootVersion,
              javaVersion,
              provenance);
      var files = ServerSkeleton.generate(document, options);

      if (files.isEmpty()) {
        var message =
            "mateu-server: the contract asks this project to implement nothing"
                + ("generate".equalsIgnoreCase(provenance)
                    ? " — every endpoint it declares is already served elsewhere"
                    : "");
        if (failOnEmpty) {
          throw new MojoExecutionException(message);
        }
        getLog().info(message);
        return;
      }

      var root = outputDirectory.toPath();
      for (var file : files) {
        var target = root.resolve(file.path());
        Files.createDirectories(target.getParent());
        Files.writeString(target, file.content());
      }
      getLog()
          .info(
              "mateu-server: "
                  + files.size()
                  + " file(s) written to "
                  + root
                  + " — implement the ports it names (see its README.md); everything in it is"
                  + " regenerated on every run");
    } catch (MojoExecutionException e) {
      throw e;
    } catch (Exception e) {
      throw new MojoExecutionException("mateu-server failed", e);
    }
  }
}
