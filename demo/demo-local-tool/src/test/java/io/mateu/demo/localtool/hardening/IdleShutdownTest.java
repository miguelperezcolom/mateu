package io.mateu.demo.localtool.hardening;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import io.mateu.demo.localtool.Quit;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class IdleShutdownTest {

  static class MovableClock extends Clock {
    Instant now = Instant.parse("2026-11-14T10:00:00Z");

    @Override
    public java.time.ZoneId getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return now;
    }
  }

  @Test
  void stopsOnlyAfterTheLimitWithoutRequests() throws Exception {
    var clock = new MovableClock();
    var quit = mock(Quit.class);
    var idle = new IdleShutdown(Duration.ofMinutes(30), quit, clock);

    clock.now = clock.now.plus(Duration.ofMinutes(20));
    idle.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), new MockFilterChain());
    clock.now = clock.now.plus(Duration.ofMinutes(20));
    idle.check();
    verify(quit, never()).soon(); // 20 minutes since the last request

    clock.now = clock.now.plus(Duration.ofMinutes(11));
    idle.check();
    verify(quit).soon();
  }

  @Test
  void zeroTurnsItOff() {
    var clock = new MovableClock();
    var quit = mock(Quit.class);
    var idle = new IdleShutdown(Duration.ZERO, quit, clock);
    clock.now = clock.now.plus(Duration.ofDays(3));
    idle.check();
    verify(quit, never()).soon();
  }
}
