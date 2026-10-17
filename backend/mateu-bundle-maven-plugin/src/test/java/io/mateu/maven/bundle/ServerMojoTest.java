package io.mateu.maven.bundle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertThrows;

import io.mateu.maven.bundle.fixtures.CataloguePage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.project.MavenProject;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

/**
 * {@code mateu-bundle:server} as a build runs it: from the OpenAPI file {@code mateu:openapi} wrote
 * to a module on disk. What the module contains is pinned in core ({@code ServerSkeletonTest}).
 */
public class ServerMojoTest {

  @Rule public TemporaryFolder tmp = new TemporaryFolder();

  Path out;
  Path contract;

  @Before
  public void dirs() throws Exception {
    out = tmp.newFolder("out").toPath();
    contract = out.resolve("mateu-openapi.json");
  }

  private ServerMojo mojo() throws Exception {
    var mojo = new ServerMojo();
    Mojos.set(mojo, "openApiFile", contract.toFile());
    Mojos.set(mojo, "outputDirectory", out.resolve("server").toFile());
    Mojos.set(mojo, "groupId", "com.acme");
    Mojos.set(mojo, "artifactId", "catalogue-api");
    Mojos.set(mojo, "version", "1.0.0");
    Mojos.set(mojo, "springBootVersion", "3.3.4");
    Mojos.set(mojo, "javaVersion", "21");
    Mojos.set(mojo, "provenance", "generate");
    return mojo;
  }

  /** The contract the openapi goal derives from {@link CataloguePage}. */
  private void deriveContract() throws Exception {
    var app = tmp.newFolder("app").toPath();
    Files.createDirectories(app.resolve("META-INF/mateu"));
    Files.writeString(
        app.resolve("META-INF/mateu/ui-registrations"),
        "class=" + CataloguePage.class.getName() + "\npath=/catalogue\n");
    var openapi = new OpenApiMojo();
    Mojos.set(
        openapi,
        "project",
        new MavenProject() {
          @Override
          public List<String> getRuntimeClasspathElements() {
            return List.of(app.toString());
          }
        });
    Mojos.set(openapi, "outputFile", contract.toFile());
    Mojos.set(openapi, "title", "Catalogue API");
    Mojos.set(openapi, "from", "classes");
    openapi.execute();
  }

  private List<String> written() throws Exception {
    var root = out.resolve("server");
    try (Stream<Path> walk = Files.walk(root)) {
      return walk.filter(Files::isRegularFile).map(p -> root.relativize(p).toString()).toList();
    }
  }

  @Test
  public void theOpenApiTheScreensImplyBecomesARunnableModule() throws Exception {
    deriveContract();

    mojo().execute();

    var files = written();
    assertThat(files).contains("pom.xml", "README.md");
    assertThat(files).anyMatch(f -> f.endsWith("Controller.java"));
    assertThat(Files.readString(out.resolve("server/pom.xml")))
        .contains("<groupId>com.acme</groupId>")
        .contains("<artifactId>catalogue-api</artifactId>");
    // only what this project owes: the third party's endpoint gets no controller
    assertThat(String.join("\n", files).toLowerCase()).doesNotContain("countr");
  }

  @Test
  public void withoutAContractTheGoalSaysWhichGoalToRunFirst() throws Exception {
    var failure = assertThrows(MojoExecutionException.class, () -> mojo().execute());
    assertThat(failure.getMessage()).contains("run mateu:openapi first");
  }

  /** Nothing to implement: a contract made only of other people's endpoints writes nothing. */
  @Test
  public void aContractOfOnlyExternalEndpointsWritesNothing() throws Exception {
    Files.writeString(contract, externalOnly());

    mojo().execute();

    assertThat(out.resolve("server")).doesNotExist();
  }

  @Test
  public void failOnEmptyTurnsANothingToImplementContractIntoAFailure() throws Exception {
    Files.writeString(contract, externalOnly());
    var mojo = mojo();
    Mojos.set(mojo, "failOnEmpty", true);

    var failure = assertThrows(MojoExecutionException.class, mojo::execute);
    assertThat(failure.getMessage())
        .contains("implement nothing")
        .contains("already served elsewhere");
  }

  @Test
  public void anUnreadableContractFailsTheGoal() throws Exception {
    Files.writeString(contract, "{ not json");

    var failure = assertThrows(MojoExecutionException.class, () -> mojo().execute());
    assertThat(failure.getMessage()).isEqualTo("mateu-server failed");
  }

  private static String externalOnly() {
    return """
        {"openapi": "3.0.3", "info": {"title": "x", "version": "1"},
         "paths": {"/all": {"get": {"operationId": "countries",
           "x-mateu-provenance": "existing",
           "responses": {"200": {"description": "ok"}}}}}}
        """;
  }
}
