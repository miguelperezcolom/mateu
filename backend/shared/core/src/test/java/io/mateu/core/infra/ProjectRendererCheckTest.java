package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.ProjectRenderer;
import io.mateu.uidl.data.ProjectSettings;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The project descriptor ({@code specs/ui/project.yaml}) is read off the classpath, and a server
 * whose renderer jar disagrees with it gets a WARN that names both artifacts.
 */
class ProjectRendererCheckTest {

  @TempDir Path dir;

  private ClassLoader classpath(Map<String, String> files) throws Exception {
    for (var e : files.entrySet()) {
      var file = dir.resolve(e.getKey());
      Files.createDirectories(file.getParent());
      Files.writeString(file, e.getValue());
    }
    return new URLClassLoader(new URL[] {dir.toUri().toURL()}, null);
  }

  @Test
  void readsTheConventionalDescriptor() throws Exception {
    var cl = classpath(Map.of("specs/ui/project.yaml", "type: Project\nrenderer: redwood\n"));
    assertThat(ProjectRendererCheck.read(cl))
        .contains(new ProjectSettings(ProjectRenderer.redwood));
  }

  @Test
  void findsADescriptorByItsTypeAnywhereUnderSpecsUi() throws Exception {
    var cl =
        classpath(
            Map.of(
                "specs/ui/settings/the-project.yaml", "type: Project\nrenderer: REDWOOD\n",
                "specs/ui/app.ui.yaml", "type: UI\nbasePath: ''\nroutes: [routes.yaml]\n"));
    assertThat(ProjectRendererCheck.read(cl))
        .map(ProjectSettings::renderer)
        .contains(ProjectRenderer.redwood);
  }

  @Test
  void noDescriptorMeansNothingDeclared() throws Exception {
    var cl = classpath(Map.of("specs/ui/app.ui.yaml", "type: UI\nbasePath: ''\n"));
    assertThat(ProjectRendererCheck.read(cl)).isEmpty();
  }

  @Test
  void aMissingOrUnknownRendererReadsAsVaadin() {
    assertThat(ProjectRendererCheck.parse("type: Project\n"))
        .map(ProjectSettings::renderer)
        .contains(ProjectRenderer.vaadin);
    assertThat(ProjectRendererCheck.parse("type: Project\nrenderer: swing\n"))
        .map(ProjectSettings::renderer)
        .contains(ProjectRenderer.vaadin);
    assertThat(ProjectRendererCheck.parse("type: UI\n")).isEmpty();
  }

  @Test
  void detectsTheServedRendererFromTheClasspath() throws Exception {
    assertThat(
            ProjectRendererCheck.served(
                classpath(Map.of("static/_index.html", "<html/>", "static/assets/x.js", ""))))
        .isEqualTo(ProjectRenderer.vaadin);
  }

  @Test
  void detectsRedwood() throws Exception {
    assertThat(
            ProjectRendererCheck.served(
                classpath(
                    Map.of(
                        "static/_index.html", "<html/>", "static/_redwood/app-flow.json", "{}"))))
        .isEqualTo(ProjectRenderer.redwood);
  }

  @Test
  void detectsPrimer() throws Exception {
    assertThat(
            ProjectRendererCheck.served(
                classpath(
                    Map.of("static/_index.html", "<html/>", "static/assets/mateu-primer.js", ""))))
        .isEqualTo(ProjectRenderer.primer);
    assertThat(ProjectRendererCheck.parse("type: Project\nrenderer: primer\n"))
        .map(ProjectSettings::renderer)
        .contains(ProjectRenderer.primer);
  }

  @Test
  void detectsUi5() throws Exception {
    assertThat(
            ProjectRendererCheck.served(
                classpath(
                    Map.of("static/_index.html", "<html/>", "static/assets/mateu-ui5.js", ""))))
        .isEqualTo(ProjectRenderer.ui5);
    assertThat(ProjectRendererCheck.parse("type: Project\nrenderer: ui5\n"))
        .map(ProjectSettings::renderer)
        .contains(ProjectRenderer.ui5);
  }

  @Test
  void aUi5ClasspathWithAPrimerDescriptorWarns() {
    assertThat(
            ProjectRendererCheck.mismatch(
                new ProjectSettings(ProjectRenderer.primer), ProjectRenderer.ui5))
        .get()
        .asString()
        .contains("io.mateu:mateu-ui5")
        .contains("io.mateu:mateu-primer");
  }

  @Test
  void detectsSlds() throws Exception {
    assertThat(
            ProjectRendererCheck.served(
                classpath(
                    Map.of("static/_index.html", "<html/>", "static/assets/mateu-slds.js", ""))))
        .isEqualTo(ProjectRenderer.slds);
    assertThat(ProjectRendererCheck.parse("type: Project\nrenderer: slds\n"))
        .map(ProjectSettings::renderer)
        .contains(ProjectRenderer.slds);
    assertThat(
            ProjectRendererCheck.mismatch(
                new ProjectSettings(ProjectRenderer.vaadin), ProjectRenderer.slds))
        .get()
        .asString()
        .contains("io.mateu:mateu-slds");
  }

  @Test
  void aPrimerClasspathWithAVaadinDescriptorWarns() {
    assertThat(
            ProjectRendererCheck.mismatch(
                new ProjectSettings(ProjectRenderer.vaadin), ProjectRenderer.primer))
        .get()
        .asString()
        .contains("io.mateu:mateu-primer")
        .contains("io.mateu:mateu-vaadin");
  }

  @Test
  void aHeadlessServerServesNone() throws Exception {
    assertThat(ProjectRendererCheck.served(classpath(Map.of("x.txt", "")))).isNull();
  }

  @Test
  void aMismatchIsReportedNamingBothArtifacts() {
    var warning =
        ProjectRendererCheck.mismatch(
            new ProjectSettings(ProjectRenderer.redwood), ProjectRenderer.vaadin);
    assertThat(warning).isPresent();
    assertThat(warning.get())
        .contains("renderer: redwood")
        .contains("io.mateu:mateu-vaadin")
        .contains("io.mateu:mateu-redwood")
        .contains("specs/ui/project.yaml");
  }

  @Test
  void agreementNoDescriptorOrHeadlessSayNothing() {
    assertThat(
            ProjectRendererCheck.mismatch(
                new ProjectSettings(ProjectRenderer.redwood), ProjectRenderer.redwood))
        .isEmpty();
    assertThat(ProjectRendererCheck.mismatch(null, ProjectRenderer.redwood)).isEmpty();
    assertThat(ProjectRendererCheck.mismatch(new ProjectSettings(ProjectRenderer.redwood), null))
        .isEmpty();
  }

  @Test
  void warnOnceNeverThrows() throws Exception {
    ProjectRendererCheck.reset();
    var cl =
        classpath(
            Map.of(
                "specs/ui/project.yaml", "type: Project\nrenderer: redwood\n",
                "static/_index.html", "<html/>"));
    ProjectRendererCheck.warnOnce(cl);
    ProjectRendererCheck.warnOnce(cl); // the second call is a no-op
    ProjectRendererCheck.reset();
  }
}
