package io.mateu.core.infra;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;

/**
 * Says, once at startup, that the application serves no Mateu UI at all — no routed class (the
 * annotation processor generates one {@link RoutedClassProvider} per {@code @UI} class) and no YAML
 * mount ({@code type: UI} under {@code specs/ui}).
 *
 * <p>The commonest cause is the annotation processor missing from {@code annotationProcessorPaths}
 * (or replaced by another processor list): the app compiles and boots normally and then every URL
 * answers 404, with nothing in the log to say why.
 */
@Slf4j
public final class NothingToServeCheck {

  private static final AtomicBoolean WARNED = new AtomicBoolean(false);

  private NothingToServeCheck() {}

  /**
   * The warning text when nothing is served, or {@code null} when there is a UI to serve.
   *
   * @param routedClasses how many routed classes the container knows about
   * @param yamlMounts whether the classpath declares at least one YAML mount
   * @param processorArtifact the adapter's annotation processor, e.g. {@code
   *     mateu-annotation-processor-mvc}
   */
  public static String message(int routedClasses, boolean yamlMounts, String processorArtifact) {
    if (routedClasses > 0 || yamlMounts) {
      return null;
    }
    return "Mateu found no UI to serve: no @UI class was processed and there is no YAML mount"
        + " (a `type: UI` file under src/main/resources/specs/ui). Every Mateu URL will answer"
        + " 404. If you have @UI classes, the annotation processor did not run: add io.mateu:"
        + processorArtifact
        + " to maven-compiler-plugin's <annotationProcessorPaths> (next to Lombok — once that list"
        + " is set, nothing else on the classpath runs as a processor) and rebuild with `mvn clean"
        + " compile`. If your @UI classes live in a library module, that module also needs"
        + " mateu-annotation-processor-indexer and the app must list it in"
        + " <annotationProcessorPaths>.";
  }

  /** Logs {@link #message} once per JVM, reading the routed classes from the bean container. */
  public static void warnOnStartup(String processorArtifact) {
    int routed = 0;
    try {
      if (MateuBeanProvider.isInitialized()) {
        var beans = MateuBeanProvider.getBeans(RoutedClassProvider.class);
        routed = beans != null ? beans.size() : 0;
      }
    } catch (RuntimeException e) {
      return; // a container that cannot tell: say nothing rather than something wrong
    }
    var text =
        message(
            routed,
            YamlMounts.present(Thread.currentThread().getContextClassLoader()),
            processorArtifact);
    if (text != null && WARNED.compareAndSet(false, true)) {
      log.warn(text);
    }
  }
}
