package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * An app whose annotation processor did not run used to boot cleanly and answer 404 everywhere with
 * nothing in the log. The startup check names the processor to add.
 */
class NothingToServeCheckTest {

  @Test
  void anAppWithNoRoutedClassAndNoYamlMountIsToldWhichProcessorToAdd() {
    var text = NothingToServeCheck.message(0, false, "mateu-annotation-processor-mvc");

    assertThat(text)
        .contains("no @UI class was processed")
        .contains("io.mateu:mateu-annotation-processor-mvc")
        .contains("<annotationProcessorPaths>")
        .contains("mateu-annotation-processor-indexer");
  }

  @Test
  void aRoutedClassOrAYamlMountIsEnoughToStaySilent() {
    assertThat(NothingToServeCheck.message(1, false, "x")).isNull();
    assertThat(NothingToServeCheck.message(0, true, "x")).isNull();
  }

  @Test
  void aWebFluxMountResolverCountsAsAServedUi() throws Exception {
    // the WebFlux/Quarkus/Helidon processors generate a RouteResolver per mount, not a
    // RoutedClassProvider: a working WebFlux starter used to log "Every Mateu URL will answer 404"
    var resolver =
        new io.mateu.uidl.interfaces.RouteResolver() {
          @Override
          public Class<?> resolveRoute(
              String route, String consumedRoute, io.mateu.uidl.interfaces.HttpRequest rq) {
            return Object.class;
          }

          @Override
          public java.util.List<io.mateu.uidl.interfaces.CompiledRouteValue>
              supportedRoutesPatterns() {
            return java.util.List.of();
          }
        };
    var field = io.mateu.uidl.di.MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    var previous = field.get(null);
    try {
      io.mateu.uidl.di.MateuBeanProvider.setBeanProvider(
          new io.mateu.uidl.di.BeanProvider() {
            @Override
            public <T> T getBean(Class<T> c) {
              return null;
            }

            @Override
            @SuppressWarnings("unchecked")
            public <T> java.util.Collection<T> getBeans(Class<T> c) {
              return c == io.mateu.uidl.interfaces.RouteResolver.class
                  ? (java.util.Collection<T>) java.util.List.of(resolver)
                  : java.util.List.of();
            }
          });
      assertThat(NothingToServeCheck.servedUis()).isEqualTo(1);
    } finally {
      field.set(null, previous); // other tests in this JVM keep their provider
    }
  }
}
