package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.di.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * The registry's one-time load must not run holding a MONITOR. On JDK 21 a virtual thread blocked
 * on a monitor pins its carrier; with Micronaut running handlers on virtual threads, a burst of
 * concurrent first requests pinned every carrier on {@code synchronized (this)} while the loader
 * waited for logback's lock — handed to a virtual thread that then had no carrier to run on — and
 * the server deadlocked (reproduced on micronaut-app1 with 32 parallel first loads).
 */
class RouteRegistryLoadLockTest {

  private final RouteRegistry registry = new RouteRegistry();
  private final AtomicBoolean loadedHoldingTheMonitor = new AtomicBoolean();

  @AfterEach
  void restore() {
    MateuBeanProvider.setBeanProvider(null);
  }

  @Test
  void theLoadDoesNotHoldTheRegistryMonitorAndConcurrentFirstCallsAllComplete() throws Exception {
    MateuBeanProvider.setBeanProvider(
        new BeanProvider() {
          @Override
          public <T> T getBean(Class<T> clazz) {
            return null;
          }

          @Override
          public <T> Collection<T> getBeans(Class<T> clazz) {
            if (clazz == RouteEntrySupplier.class && Thread.holdsLock(registry)) {
              loadedHoldingTheMonitor.set(true);
            }
            return List.of();
          }
        });

    var futures = new ArrayList<Future<?>>();
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
      for (int i = 0; i < 64; i++) {
        futures.add(executor.submit(registry::authored));
      }
      for (var future : futures) {
        assertThat(future.get(30, TimeUnit.SECONDS)).isNotNull();
      }
    }

    assertThat(loadedHoldingTheMonitor).isFalse();
  }
}
