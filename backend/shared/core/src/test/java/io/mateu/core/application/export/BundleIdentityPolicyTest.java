package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A screen whose structure depends on WHO is asking is not pre-rendered into the static bundle.
 *
 * <p>A bundle is one file served to everyone, and export runs headless: with no Authorization
 * header the {@code Authorizer} denies restricted content, so the danger is not a leak — it fails
 * closed — but a screen that is <em>permanently wrong</em>. The pre-rendered variant would be the
 * DENIED one, and an authorised user on a static host has no server left to re-render what they are
 * entitled to. So the route is skipped and stays backend-served.
 */
class BundleIdentityPolicyTest {

  @SuppressWarnings("unused")
  @UI("/plain-screen")
  @Title("Plain")
  public static class PlainScreen {
    public String name = "Widget";
  }

  @SuppressWarnings("unused")
  @UI("/restricted-screen")
  @Title("Restricted")
  @EyesOnly(roles = "admin")
  public static class RestrictedScreen {
    public String name = "Widget";
  }

  @SuppressWarnings("unused")
  @UI("/partly-restricted")
  @Title("Partly restricted")
  public static class PartlyRestricted {
    public String name = "Widget";

    @EyesOnly(roles = "admin")
    public String secret = "only for admins";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PlainScreen.class, RestrictedScreen.class, PartlyRestricted.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static MateuBundleExporter.BundleEntry entryFor(String route) {
    var manifest =
        new MateuBundleExporter(mateu.service())
            .exportAll("", BundleIdentityPolicyTest.class.getClassLoader(), false, true);
    return manifest.entries().stream()
        .filter(e -> route.equals(e.route()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no bundle entry for " + route));
  }

  @Test
  void aScreenGatedOnIdentityIsNotBundled() {
    var entry = entryFor("/restricted-screen");
    assertThat(entry.ok()).isFalse();
    assertThat(entry.json()).isNull();
    assertThat(entry.skipReason()).contains("identity-dependent").contains("@EyesOnly");
  }

  @Test
  void aScreenWithOneRestrictedFieldIsNotBundledEither() {
    // The whole screen is skipped, not just the field: what would be baked is the denied variant of
    // the page, and a static host cannot re-render it for someone who may see the field.
    var entry = entryFor("/partly-restricted");
    assertThat(entry.ok()).isFalse();
    assertThat(entry.skipReason()).contains("secret");
  }

  @Test
  void anOrdinaryScreenIsStillBundled() {
    var entry = entryFor("/plain-screen");
    assertThat(entry.ok()).as("skipped because: %s", entry.skipReason()).isTrue();
    assertThat(entry.json()).isNotBlank();
  }

  @Test
  void theSkipReasonSaysWhereTheRestrictionIs() {
    // The reason is what a developer reads in the build log when a route silently stops being
    // bundled, so it names the member rather than just the rule.
    assertThat(entryFor("/partly-restricted").skipReason())
        .contains("field 'secret'")
        .contains("backend-served");
  }
}
