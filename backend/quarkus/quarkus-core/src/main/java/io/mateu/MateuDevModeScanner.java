package io.mateu;

import io.mateu.core.infra.dev.DevEndpoint;
import io.mateu.core.infra.dev.DevMode;
import io.quarkus.dev.spi.DevModeType;
import io.quarkus.dev.spi.HotReplacementContext;
import io.quarkus.dev.spi.HotReplacementSetup;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.jboss.logging.Logger;

/**
 * Live reload of Java code in Quarkus dev mode ({@code mateu.dev=true}).
 *
 * <p>Quarkus looks for changed sources, recompiles and restarts only when an HTTP request arrives.
 * The browser's open live-reload stream ({@code /mateu/dev/events}) is not a new request, so after
 * editing a class nothing happened until somebody reloaded the page by hand — exactly what live
 * reload is for. While at least one stream is open this asks Quarkus to scan, once a second, as a
 * request would; a restart drops the stream, the browser reconnects, sees a new boot id and
 * re-renders.
 *
 * <p>Quarkus loads it (a {@link HotReplacementSetup} service) in dev mode only, once per session.
 * It scans only for CHANGES ({@code doScan(false)}): a broken build is not retried every second,
 * the next change or request does.
 */
public class MateuDevModeScanner implements HotReplacementSetup {

  private static final Logger LOG = Logger.getLogger(MateuDevModeScanner.class);

  static final long PERIOD_MILLIS = 1000;

  private ScheduledExecutorService scheduler;

  @Override
  public void setupHotDeployment(HotReplacementContext context) {
    if (context.getDevModeType() != DevModeType.LOCAL) {
      return;
    }
    scheduler =
        Executors.newSingleThreadScheduledExecutor(
            runnable -> {
              var thread = new Thread(runnable, "mateu-dev-scanner");
              thread.setDaemon(true);
              return thread;
            });
    scheduler.scheduleWithFixedDelay(
        () -> scan(context), PERIOD_MILLIS, PERIOD_MILLIS, TimeUnit.MILLISECONDS);
  }

  static boolean scan(HotReplacementContext context) {
    if (!DevMode.enabled() || DevEndpoint.connections() == 0) {
      return false;
    }
    try {
      return context.doScan(false);
    } catch (Throwable e) {
      // a compilation error is reported by Quarkus itself (log + error page on the next request)
      LOG.debugf(e, "Mateu dev-mode scan failed");
      return false;
    }
  }

  @Override
  public void close() {
    if (scheduler != null) {
      scheduler.shutdownNow();
    }
  }
}
