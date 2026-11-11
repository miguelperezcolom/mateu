package io.mateu;

import io.micronaut.context.annotation.Value;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Singleton;
import java.util.logging.Logger;

/**
 * Warns, once at startup, when Mateu's endpoints run on virtual threads on a JDK that pins them.
 *
 * <p>On Java 21+ Micronaut runs its blocking executor (Mateu's actions) on virtual threads. Before
 * JDK 24 a virtual thread that blocks inside a {@code synchronized} block pins its carrier thread
 * (JEP 491 removed that in 24), so code that synchronizes while blocking — verbose logging, some
 * drivers — can stall a burst of requests. It is a JVM limitation: the fix is the JDK, or turning
 * virtual threads off for the blocking executor.
 */
@Singleton
public class MateuVirtualThreadsCheck implements ApplicationEventListener<StartupEvent> {

  private static final Logger LOG = Logger.getLogger(MateuVirtualThreadsCheck.class.getName());

  private final String virtualSetting;

  public MateuVirtualThreadsCheck(
      @Value("${micronaut.executors.blocking.virtual:}") String virtualSetting) {
    this.virtualSetting = virtualSetting;
  }

  @Override
  public void onApplicationEvent(StartupEvent event) {
    var warning = warning(Runtime.version().feature(), virtualSetting);
    if (warning != null) {
      LOG.warning(warning);
    }
  }

  /** The warning for this JDK and setting, or null when there is nothing to warn about. */
  static String warning(int jdkFeature, String virtualSetting) {
    if (jdkFeature < 21 || jdkFeature >= 24) {
      return null;
    }
    if (virtualSetting != null && "false".equalsIgnoreCase(virtualSetting.trim())) {
      return null;
    }
    return "Mateu: Micronaut serves Mateu's actions on virtual threads, and on JDK "
        + jdkFeature
        + " a virtual thread blocked inside synchronized code pins its carrier thread — a burst of"
        + " requests can stall. Run on JDK 24 or later, or set"
        + " micronaut.executors.blocking.virtual=false.";
  }
}
