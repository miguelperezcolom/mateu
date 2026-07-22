package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Text;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The CI primitive of the layout-diff tooling: a stable fingerprint of the page-level decisions,
 * meant to be pinned in a golden test so an inferred flip fails CI instead of surprising users.
 */
class PageFingerprintTest {

  static class PlainForm {
    String name;
  }

  @AutoPage
  static class MetricsPage {
    MetricCard revenue = MetricCard.builder().title("Revenue").value("1").build();
  }

  @AutoPage
  static class ButtonsPage {
    Button start = Button.builder().label("Start").actionId("start").build();

    @Panel(title = "Today")
    Text today = new Text("t", "42");
  }

  @Test
  void fingerprintsCaptureThePageTypeAndTheComposedArchetype() {
    assertThat(PageFingerprint.of(PlainForm.class)).isEqualTo("pageType=form composes=none");
    assertThat(PageFingerprint.of(MetricsPage.class))
        .isEqualTo("pageType=dashboard composes=dashboard");
    assertThat(PageFingerprint.of(ButtonsPage.class))
        .isEqualTo("pageType=landing composes=welcome");
  }

  @Test
  void theBatchFormIsSortedByClassNameReadyToSnapshot() {
    var fingerprints =
        PageFingerprint.of(List.of(MetricsPage.class, PlainForm.class, ButtonsPage.class));

    assertThat(fingerprints.keySet())
        .containsExactly(
            ButtonsPage.class.getName(), MetricsPage.class.getName(), PlainForm.class.getName());
  }
}
