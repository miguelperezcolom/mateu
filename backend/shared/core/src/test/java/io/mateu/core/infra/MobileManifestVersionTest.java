package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * The hub manifest says which Mateu release serves the UI ({@code mateuVersion}), so the phone and
 * desktop apps can tell whether they predate it (conformance/client/app-compat.json). Only a
 * RELEASE travels: a development build names nothing an app could compare itself with. .NET's
 * {@code MobileManifestTests} and Python's {@code test_mobile_manifest.py} pin the same rule.
 */
class MobileManifestVersionTest {

  private static final MobileManifest.Source PLAIN =
      new MobileManifest.Source("Plain", null, null, null, null);

  @Test
  void aReleaseTravelsAfterMinAppVersion() {
    assertThat(MobileManifest.toJson(MobileManifest.build(PLAIN, "3.0-beta.33")))
        .isEqualTo(
            "{\"name\":\"Plain\",\"shortName\":\"Plain\",\"wireVersion\":\"3.0\","
                + "\"minAppVersion\":\"1.0.0\",\"mateuVersion\":\"3.0-beta.33\"}");
  }

  @Test
  void aDevelopmentBuildSendsNoVersion() {
    for (String dev :
        new String[] {null, "", "0.0.1-MATEU", "3.0-SNAPSHOT", "3.0.0.dev0", "3.0.0-dev"}) {
      assertThat(MobileManifest.build(PLAIN, dev)).doesNotContainKey("mateuVersion");
    }
  }

  @Test
  void releasesOfEveryPortAreRecognised() {
    for (String release :
        new String[] {
          "3.0-beta.33", "3.0-rc.1", "3.1.0", "3.0", "3.0.0-beta.33", "3.0.0b33", "3.0.0a412"
        }) {
      assertThat(MobileManifest.releaseVersion(release)).as(release).isEqualTo(release);
    }
  }
}
