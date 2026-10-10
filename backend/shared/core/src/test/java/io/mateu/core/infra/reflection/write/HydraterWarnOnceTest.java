package io.mateu.core.infra.reflection.write;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

/**
 * A value that cannot be written into a field used to vanish at DEBUG — the field silently kept its
 * initializer. It is a WARN now, once per (class, field), without the rejected value.
 */
class HydraterWarnOnceTest {

  static class Booking {
    Integer nights;
  }

  @Test
  void aFailingFieldWarnsOnceAndNeverQuotesTheValue() {
    var logger = (Logger) LoggerFactory.getLogger(Hydrater.class);
    var logs = new ListAppender<ILoggingEvent>();
    logs.start();
    logger.addAppender(logs);
    try {
      var failure = new NumberFormatException("For input string: \"secret-value\"");
      Hydrater.warnOnce(Booking.class, "nights", failure);
      Hydrater.warnOnce(Booking.class, "nights", failure);
      Hydrater.warnOnce(Booking.class, "noSuchField", failure);

      var warnings = logs.list.stream().filter(e -> e.getLevel() == Level.WARN).toList();
      assertThat(warnings).hasSize(1);
      assertThat(warnings.get(0).getFormattedMessage())
          .contains("nights", Booking.class.getName())
          .doesNotContain("secret-value");
    } finally {
      logger.detachAppender(logs);
    }
  }
}
