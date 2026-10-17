package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The bundle export on a backend shaped like WebFlux/Quarkus/Helidon — routes come only from
 * pre-compiled {@code RouteResolver}s, no {@code RoutedClassProvider} — still finds every mount,
 * keeps {@code :param} routes out of a static-only bundle, recognises a screen whose ACTION is
 * gated on identity, and reports a screen that fails to render with the real reason instead of
 * baking a broken page.
 */
class BundleExportCompiledRoutesTest {

  @UI("/cr-plain")
  @Title("Plain")
  public static class Plain {
    public String name = "Widget";
  }

  @UI("/cr-method")
  @Title("Method restricted")
  public static class MethodRestricted {
    public String name = "Widget";

    @Toolbar
    @EyesOnly(roles = "admin")
    public void purge() {}
  }

  @UI("/cr-things/:id")
  @Title("Thing")
  public static class Thing {
    public String id;
  }

  @UI("/cr-broken")
  @Title("Broken")
  public static class Broken {
    public String name = explode();

    private static String explode() {
      throw new IllegalStateException("the database is not reachable at build time");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withCompiledRouteResolvers(
            Plain.class, MethodRestricted.class, Thing.class, Broken.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static MateuBundleExporter.BundleManifest export() {
    return new MateuBundleExporter(mateu.service())
        .exportAll("", BundleExportCompiledRoutesTest.class.getClassLoader(), true);
  }

  private static MateuBundleExporter.BundleEntry entry(
      MateuBundleExporter.BundleManifest manifest, String route) {
    return manifest.entries().stream()
        .filter(e -> route.equals(e.route()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no entry for " + route + " in " + manifest));
  }

  @Test
  void everyCompiledMountIsExportedAndParamRoutesStayOutOfAStaticBundle() {
    var manifest = export();
    var plain = entry(manifest, "/cr-plain");
    assertThat(plain.ok()).isTrue();
    assertThat(plain.syncPath()).isEqualTo("cr-plain");
    assertThat(plain.json()).contains("Widget");
    assertThat(manifest.entries()).noneMatch(e -> e.route().startsWith("/cr-things"));
  }

  @Test
  void aScreenWithAnIdentityGatedActionIsKeptBackendServed() {
    var restricted = entry(export(), "/cr-method");
    assertThat(restricted.ok()).isFalse();
    assertThat(restricted.json()).isNull();
    assertThat(restricted.skipReason()).contains("method 'purge'").contains("@EyesOnly");
  }

  @Test
  void aScreenThatFailsToRenderIsSkippedWithTheRealReason() {
    var broken = entry(export(), "/cr-broken");
    assertThat(broken.ok()).isFalse();
    assertThat(broken.skipReason()).contains("the database is not reachable at build time");
  }
}
