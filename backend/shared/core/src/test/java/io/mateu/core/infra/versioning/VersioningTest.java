package io.mateu.core.infra.versioning;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class VersioningTest {

  @AfterEach
  void cleanUp() {
    System.clearProperty(AppBuild.SETTING);
    RendererCompatibility.reset();
    ModuleVersions.reset();
  }

  @Test
  void majorMinorOfReleasesOnly() {
    assertThat(MateuVersion.majorMinor("3.0-beta.12")).isEqualTo("3.0");
    assertThat(MateuVersion.majorMinor("3.1.4")).isEqualTo("3.1");
    assertThat(MateuVersion.majorMinor("3.0-alpha.430")).isEqualTo("3.0");
    // the repository's own development build is not a release
    assertThat(MateuVersion.majorMinor("0.0.1-MATEU")).isNull();
    assertThat(MateuVersion.majorMinor("garbage")).isNull();
    assertThat(MateuVersion.majorMinor(null)).isNull();
  }

  @Test
  void theBuildIdIsDeterministicAndFollowsTheExposedTypes() {
    var cl = getClass().getClassLoader();
    var types = List.of(MateuVersion.class.getName(), AppBuild.class.getName());
    var first = AppBuild.compute(types, cl);
    assertThat(first).matches("[0-9a-f]{16}");
    // order of the input does not matter: replicas of one release agree
    assertThat(AppBuild.compute(List.of(types.get(1), types.get(0)), cl)).isEqualTo(first);
    // another set of screens is another build
    assertThat(AppBuild.compute(List.of(MateuVersion.class.getName()), cl)).isNotEqualTo(first);
  }

  @Test
  void aConfiguredBuildIdWinsAndIsSanitised() {
    System.setProperty(AppBuild.SETTING, " release 42/rc1 ");
    assertThat(AppBuild.id()).isEqualTo("release-42-rc1");
    assertThat(AppBuild.sanitize("x".repeat(100))).hasSize(64);
    assertThat(AppBuild.sanitize("   ")).isNull();
  }

  @Test
  void theBuildIdIsUnknownUntilTheExposedTypesAreRegistered() {
    AppBuild.register(() -> List.of(MateuVersion.class.getName()));
    var id = AppBuild.id();
    assertThat(id).isNotNull();
    assertThat(AppBuild.id()).isSameAs(id);
    AppBuild.register(() -> List.of(AppBuild.class.getName()));
    assertThat(AppBuild.id()).isNotEqualTo(id);
  }

  @Test
  void onlyAnotherWireMajorIsAMismatch() {
    assertThat(RendererCompatibility.isMismatch("vaadin/3.4.0 wire/3.7")).isFalse();
    assertThat(RendererCompatibility.isMismatch("react-native/1.0.0 wire/2.0")).isTrue();
    assertThat(RendererCompatibility.isMismatch("intellij/0.2.17 wire/4.0")).isTrue();
    assertThat(RendererCompatibility.isMismatch("something else")).isFalse();
    assertThat(RendererCompatibility.isMismatch(null)).isFalse();
    // never throws, whatever the client sends
    RendererCompatibility.check("vaadin/2.0 wire/2.0\r\nforged");
    RendererCompatibility.check("vaadin/2.0 wire/2.0\r\nforged");
  }

  @Test
  void flagsModulesBuiltAgainstAnotherMinor(@TempDir Path dir) throws Exception {
    var older = module(dir.resolve("older"), "mateuVersion=3.1.0\n");
    var same = module(dir.resolve("same"), "mateuVersion=3.0-beta.6\n");
    var unrecorded = module(dir.resolve("unrecorded"), "");
    try (var cl = new URLClassLoader(new java.net.URL[] {older, same, unrecorded}, null)) {
      var mismatches = ModuleVersions.check(cl, "3.0-beta.12");
      assertThat(mismatches).hasSize(1);
      assertThat(mismatches.get(0).moduleVersion()).isEqualTo("3.1.0");
      assertThat(mismatches.get(0).index()).contains("older");
      // a development host compares nothing
      assertThat(ModuleVersions.check(cl, "0.0.1-MATEU")).isEmpty();
    }
  }

  private static java.net.URL module(Path root, String versionLine) throws Exception {
    var index = root.resolve("META-INF/mateu/ui-registrations");
    Files.createDirectories(index.getParent());
    Files.writeString(index, "class=com.example.Home\n" + versionLine + "path=/home\n");
    return root.toUri().toURL();
  }
}
