package io.mateu.core.domain.out;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import org.junit.jupiter.api.Test;

class MessageMapperTest {

  @Test
  void anErrorStaysUntilDismissed() {
    // owner, 2026-10-12: an error toast is sticky (duration 0) in every backend and renderer — the
    // mapper turned the error boundary's 0 into 3000 ms, so a failed save's reason vanished
    var error =
        MessageMapper.mapToMessageDtos(
            Message.builder().variant(NotificationVariant.error).text("Boom").duration(4000).build(),
            "",
            null);
    assertThat(error.get(0).duration()).isZero();
    var success =
        MessageMapper.mapToMessageDtos(
            Message.builder().variant(NotificationVariant.success).text("Saved").build(), "", null);
    assertThat(success.get(0).duration()).isEqualTo(3000);
  }
}
