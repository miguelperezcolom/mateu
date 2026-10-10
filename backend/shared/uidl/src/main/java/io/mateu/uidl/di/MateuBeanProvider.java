package io.mateu.uidl.di;

import java.util.Collection;

/**
 * Static access to the container's beans for code that is not itself a bean (view models,
 * reflective mappers). The adapter sets it at startup; it is {@code volatile} because the thread
 * that sets it (the container's) is not the thread that reads it (a request's).
 */
public class MateuBeanProvider {

  private static volatile BeanProvider beanProvider;

  public static void setBeanProvider(BeanProvider beanProvider) {
    MateuBeanProvider.beanProvider = beanProvider;
  }

  /** Whether an adapter has initialised it. */
  public static boolean isInitialized() {
    return beanProvider != null;
  }

  public static <T> T getBean(Class<T> clazz) {
    return provider().getBean(clazz);
  }

  public static <T> Collection<T> getBeans(Class<T> clazz) {
    return provider().getBeans(clazz);
  }

  private static BeanProvider provider() {
    var provider = beanProvider;
    if (provider == null) {
      throw new IllegalStateException(
          "MateuBeanProvider has not been initialized: no Mateu adapter (Spring MVC/WebFlux,"
              + " Quarkus, Micronaut, Helidon) has started, or this code runs outside of it. Call"
              + " MateuBeanProvider.setBeanProvider(...) first.");
    }
    return provider;
  }
}
