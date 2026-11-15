package io.mateu.demo.localtool.hardening;

import io.mateu.demo.localtool.Quit;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Stops the tool when nobody has used it for {@code local-tool.idle-shutdown} (default 30 minutes;
 * {@code 0} turns it off) — the tab closed without Quit, the laptop went to sleep. Every request
 * counts as use.
 */
@Component
public class IdleShutdown extends OncePerRequestFilter {

  private final Duration limit;
  private final Quit quit;
  private final Clock clock;
  private volatile Instant lastUse;

  @org.springframework.beans.factory.annotation.Autowired
  public IdleShutdown(
      @Value("${local-tool.idle-shutdown:30m}") Duration limit, Quit quit) {
    this(limit, quit, Clock.systemUTC());
  }

  IdleShutdown(Duration limit, Quit quit, Clock clock) {
    this.limit = limit;
    this.quit = quit;
    this.clock = clock;
    this.lastUse = clock.instant();
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    lastUse = clock.instant();
    chain.doFilter(request, response);
  }

  @Scheduled(fixedDelay = 30_000, initialDelay = 30_000)
  public void check() {
    if (!limit.isZero() && Duration.between(lastUse, clock.instant()).compareTo(limit) > 0) {
      System.out.println("  Idle for " + limit + ".");
      quit.soon();
    }
  }
}
