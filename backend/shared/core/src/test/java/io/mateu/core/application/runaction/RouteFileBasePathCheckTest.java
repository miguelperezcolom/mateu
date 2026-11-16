package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import io.mateu.core.infra.MateuController;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.di.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.LoggerFactory;

/**
 * A route file's {@code basePath} is checked against EVERY mount the app serves. An app compiled
 * with a framework annotation processor alone (the Spring Boot starter's one-processor setup) has
 * no {@code ui-registrations} of its OWN {@code @UI} classes — only a jar it depends on has one —,
 * so its {@code @UI("/shop")} was missing from the known mounts and the test fixture's {@code
 * shop-routes.yaml} ({@code basePath: /shop}) was reported at startup as a typo: "matches no @UI
 * mount. Known mounts: [, help]".
 */
class RouteFileBasePathCheckTest {

  @UI("/other-app")
  static class OtherApp {}

  @UI("/shop")
  static class Shop {}

  @TempDir Path dependencyJar;

  @AfterEach
  void restore() {
    MateuBeanProvider.setBeanProvider(null);
  }

  /** The test classpath plus the index a dependency jar carries ({@code @UI("/help")}). */
  private ClassLoader withADependencyIndex() throws IOException {
    var index = dependencyJar.resolve("META-INF/mateu/ui-registrations");
    Files.createDirectories(index.getParent());
    Files.writeString(index, "class=com.acme.help.Help\nsimpleClassName=Help\npath=/help\n");
    return new URLClassLoader(
        new URL[] {dependencyJar.toUri().toURL()}, getClass().getClassLoader());
  }

  private static void serving(List<String> controllerBaseUrls, List<Class<?>> routedClasses) {
    MateuBeanProvider.setBeanProvider(
        new BeanProvider() {
          @Override
          public <T> T getBean(Class<T> clazz) {
            return null;
          }

          @Override
          @SuppressWarnings("unchecked")
          public <T> Collection<T> getBeans(Class<T> clazz) {
            if (clazz == MateuController.class) {
              return (Collection<T>)
                  controllerBaseUrls.stream()
                      .map(baseUrl -> (MateuController) () -> baseUrl)
                      .toList();
            }
            if (clazz == RoutedClassProvider.class) {
              return (Collection<T>)
                  routedClasses.stream().map(type -> (RoutedClassProvider) () -> type).toList();
            }
            return List.of();
          }
        });
  }

  private List<String> errorsAboutShop() throws IOException {
    var logger = (Logger) LoggerFactory.getLogger(RouteRegistry.class);
    var logs = new ListAppender<ILoggingEvent>();
    logs.start();
    logger.addAppender(logs);
    try {
      new RouteRegistry().authoredFrom(withADependencyIndex());
      return logs.list.stream()
          .filter(event -> event.getLevel() == Level.ERROR)
          .map(ILoggingEvent::getFormattedMessage)
          .filter(message -> message.contains("basePath 'shop'"))
          .toList();
    } finally {
      logger.detachAppender(logs);
    }
  }

  @Test
  void aMountServedByAGeneratedControllerIsAKnownMount() throws IOException {
    serving(List.of("/shop", "/other-app"), List.of());

    assertThat(errorsAboutShop()).isEmpty();
  }

  @Test
  void theRoutedClassProvidersNameTheirUiMountsToo() throws IOException {
    serving(List.of(), List.of(Shop.class, OtherApp.class));

    assertThat(RouteRegistry.registeredMounts()).contains("shop", "other-app");
    assertThat(errorsAboutShop()).isEmpty();
  }

  @Test
  void aBasePathNoMountServesIsStillReported() throws IOException {
    serving(List.of("/other-app"), List.of(OtherApp.class));

    assertThat(errorsAboutShop()).singleElement().asString().contains("help", "other-app");
  }
}
