package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.core.infra.dev.DevEndpoint;
import io.mateu.core.infra.dev.DevMode;
import io.quarkus.dev.spi.DevModeType;
import io.quarkus.dev.spi.HotReplacementContext;
import java.lang.reflect.Proxy;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * Quarkus dev mode only looks for changed code when a request arrives; the open live-reload stream
 * is not one. The scanner asks Quarkus to look — for changes only — while a browser is watching.
 */
class MateuDevModeScannerTest {

  private final AtomicInteger scans = new AtomicInteger();

  /** What the fake Quarkus answers: the dev-mode type, and what a scan finds (or throws). */
  private DevModeType devModeType = DevModeType.LOCAL;

  private Object scanOutcome = true;

  private final java.util.concurrent.CountDownLatch scanned =
      new java.util.concurrent.CountDownLatch(1);

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
                  scanned.countDown();
                  if (scanOutcome instanceof Throwable failure) {
                    throw failure;
                  }
                  return scanOutcome;
                }
                if (method.getName().equals("getDevModeType")) {
                  return devModeType;
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

  @Test
  void aScanThatFindsNoChangeSaysSo() {
    DevMode.enable(null);
    scanOutcome = false;
    var stream = DevEndpoint.events().subscribe();
    try {
      assertFalse(MateuDevModeScanner.scan(context));
      assertEquals(1, scans.get());
    } finally {
      stream.dispose();
    }
  }

  /** A broken build: Quarkus reports it itself; the scanner just carries on. */
  @Test
  void aFailingScanIsSwallowed() {
    DevMode.enable(null);
    scanOutcome = new IllegalStateException("compilation failed");
    var stream = DevEndpoint.events().subscribe();
    try {
      assertFalse(MateuDevModeScanner.scan(context));
      assertEquals(1, scans.get());
    } finally {
      stream.dispose();
    }
  }

  /** In local dev mode the scanner runs on its own, once a period, until Quarkus closes it. */
  @Test
  void localDevModeScansPeriodicallyUntilClosed() throws Exception {
    DevMode.enable(null);
    var stream = DevEndpoint.events().subscribe();
    var scanner = new MateuDevModeScanner();
    try {
      scanner.setupHotDeployment(context);
      assertTrue(
          scanned.await(MateuDevModeScanner.PERIOD_MILLIS * 5, TimeUnit.MILLISECONDS),
          "the scanner asked Quarkus to look for changes");
    } finally {
      scanner.close();
      stream.dispose();
    }
    var afterClose = scans.get();
    Thread.sleep(MateuDevModeScanner.PERIOD_MILLIS * 2);
    assertEquals(afterClose, scans.get(), "a closed scanner scans no more");
  }

  /** Remote dev mode (and the test-only one) has its own way of syncing changes: no scanner. */
  @Test
  void otherDevModesStartNoScanner() throws Exception {
    DevMode.enable(null);
    devModeType = DevModeType.REMOTE_SERVER_SIDE;
    var stream = DevEndpoint.events().subscribe();
    var scanner = new MateuDevModeScanner();
    try {
      scanner.setupHotDeployment(context);
      assertFalse(scanned.await(MateuDevModeScanner.PERIOD_MILLIS * 2, TimeUnit.MILLISECONDS));
      assertEquals(0, scans.get());
    } finally {
      scanner.close(); // nothing was started: closing is a no-op
      stream.dispose();
    }
  }
}
