package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The renderer jars' deployable page (static/index.html, for a CDN) is never what a backend serves:
 * Spring Boot would answer it at / and /index.html when no Mateu UI sits at the root.
 */
class DeployablePageTest {

  @TempDir Path dir;

  private ClassLoader loaderWithIndex(String html) throws Exception {
    var root = Files.createDirectories(dir.resolve("cp" + System.nanoTime()));
    if (html != null) {
      Files.createDirectories(root.resolve("static"));
      Files.writeString(root.resolve("static/index.html"), html);
    }
    // no parent: only this folder (no specs/ui of the test classpath, no other static/index.html)
    return new URLClassLoader(new URL[] {root.toUri().toURL()}, null);
  }

  private static final String DEPLOYABLE =
      "<html><head><title>Mateu</title><meta name=\"mateu-backend\" content=\"\"></head></html>";

  @Test
  void theRendererPageIsHiddenAtTheRootWhenNoUiSitsThere() throws Exception {
    var cl = loaderWithIndex(DEPLOYABLE);
    assertThat(DeployablePage.hidden("/", List.of("/app"), cl)).isTrue();
    assertThat(DeployablePage.hidden("/index.html", List.of(), cl)).isTrue();
  }

  @Test
  void aRootUiKeepsTheRootAsItWas() throws Exception {
    var cl = loaderWithIndex(DEPLOYABLE);
    assertThat(DeployablePage.hidden("/", List.of("/app", ""), cl)).isFalse();
    assertThat(DeployablePage.hidden("/", List.of("/"), cl)).isFalse();
    // the file itself is never served, root UI or not
    assertThat(DeployablePage.hidden("/index.html", List.of(""), cl)).isTrue();
    // ...unless the root UI answers that path itself (WebFlux)
    assertThat(DeployablePage.hidden("/index.html", List.of(""), cl, true)).isFalse();
    assertThat(DeployablePage.hidden("/index.html", List.of("/app"), cl, true)).isTrue();
  }

  @Test
  void onlyTheRootAndTheFileItself() throws Exception {
    var cl = loaderWithIndex(DEPLOYABLE);
    assertThat(DeployablePage.hidden("/app", List.of(), cl)).isFalse();
    assertThat(DeployablePage.hidden("/assets/index.html", List.of(), cl)).isFalse();
  }

  @Test
  void anAppsOwnIndexPageIsNeverHidden() throws Exception {
    var cl = loaderWithIndex("<html><body>my landing page</body></html>");
    assertThat(DeployablePage.hidden("/", List.of(), cl)).isFalse();
    assertThat(DeployablePage.hidden("/", List.of(), loaderWithIndex(null))).isFalse();
  }

  @Test
  void recognisesTheDeployablePageByItsBackendTag() {
    assertThat(DeployablePage.isDeployablePage(DEPLOYABLE)).isTrue();
    assertThat(DeployablePage.isDeployablePage("<!-- AQUIUI --><!-- HASTAAQUIUI -->")).isFalse();
    assertThat(DeployablePage.isDeployablePage(null)).isFalse();
  }
}
