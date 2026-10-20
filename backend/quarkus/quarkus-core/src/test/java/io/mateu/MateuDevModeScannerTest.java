package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.core.infra.dev.DevEndpoint;
import io.mateu.core.infra.dev.DevMode;
import io.quarkus.dev.spi.HotReplacementContext;
import java.lang.reflect.Proxy;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * Quarkus dev mode only looks for changed code when a request arrives; the open live-reload stream
 * is not one. The scanner asks Quarkus to look — for changes only — while a browser is watching.
 */
class MateuDevModeScannerTest {

  private final AtomicInteger scans = new AtomicInteger();

  private final HotReplacementContext context =
      (HotReplacementContext)
          Proxy.newProxyInstance(
              getClass().getClassLoader(),
              new Class<?>[] {HotReplacementContext.class},
              (proxy, method, args) -> {
                if (method.getName().equals("doScan")) {
                  // only changes: a broken build must not be restarted every second
                  assertEquals(false, args[0]);
                  scans.incrementAndGet();
                  return true;
                }
                return null;
              });

  @AfterEach
  void reset() {
    DevMode.reset();
  }

  @Test
  void scansWhileABrowserIsWatching() {
    DevMode.enable(null);
    var stream = DevEndpoint.events().subscribe();
    try {
      assertTrue(MateuDevModeScanner.scan(context));
      assertEquals(1, scans.get());
    } finally {
      stream.dispose();
    }
  }

  @Test
  void doesNothingWithoutAWatchingBrowser() {
    DevMode.enable(null);
    assertEquals(0, DevEndpoint.connections());
    assertFalse(MateuDevModeScanner.scan(context));
    assertEquals(0, scans.get());
  }

  @Test
  void doesNothingWhenMateuDevModeIsOff() {
    DevMode.disable();
    var stream = DevEndpoint.events().take(Duration.ofHours(1)).subscribe();
    try {
      assertFalse(MateuDevModeScanner.scan(context));
      assertEquals(0, scans.get());
    } finally {
      stream.dispose();
    }
  }
}
