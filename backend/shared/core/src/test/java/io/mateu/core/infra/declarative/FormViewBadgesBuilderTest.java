package io.mateu.core.infra.declarative;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import org.junit.jupiter.api.Test;

class FormViewBadgesBuilderTest {

  static class WithTwoStatuses {
    Status status = new Status(StatusType.SUCCESS, "Completed");

    /** Only some records have one — null for the rest. */
    Status invocation;
  }

  @Test
  void aNullStatusGetsNoBadge() {
    // Before: a badge per Status field whatever its value, so a null one showed its unresolved
    // template — ${state.invocation.message} — as the badge text.
    var badges = FormViewBadgesBuilder.createBadges(new WithTwoStatuses());

    assertThat(badges).hasSize(1);
    assertThat(badges.get(0).text()).isEqualTo("${state.status.message}");
  }

  @Test
  void aSetStatusGetsItsBadge() {
    var model = new WithTwoStatuses();
    model.invocation = new Status(StatusType.INFO, "Synchronous · waiting to reply");

    assertThat(FormViewBadgesBuilder.createBadges(model)).hasSize(2);
  }
}
