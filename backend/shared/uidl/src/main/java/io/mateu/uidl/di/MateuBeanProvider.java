package io.mateu.uidl.di;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Static access to the container's beans for code that is not itself a bean (view models,
 * reflective mappers). The adapter sets it at startup; it is {@code volatile} because the thread
 * that sets it (the container's) is not the thread that reads it (a request's).
 */
public class MateuBeanProvider {

  private static volatile BeanProvider beanProvider;

  /** Set by the adapter at startup; an app never calls it. */
  @io.mateu.uidl.annotations.Internal("set by the adapters at startup")
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

  /**
   * The container's bean of this type, asked for ONCE per bean provider and remembered — for the
   * request path, where the same singleton (a registry, the instance factory, the translator) is
   * otherwise looked up in the container again and again on every request.
   *
   * <p>Only for types whose bean is a singleton (or a scoped proxy, which delegates per request): a
   * prototype bean asked for through here is created once and then shared. A {@code null} answer is
   * not remembered, so it is asked again. Installing another provider forgets everything remembered
   * for the previous one.
   */
  @SuppressWarnings("unchecked")
  public static <T> T getSingletonBean(Class<T> clazz) {
    var memo = memo();
    var known = memo.beans.get(clazz);
    if (known != null) {
      return (T) known;
    }
    var bean = memo.provider.getBean(clazz);
    if (bean != null) {
      memo.beans.putIfAbsent(clazz, bean);
    }
    return bean;
  }

  /**
   * {@link #getBeans}, asked for once per bean provider and remembered — the same contract as
   * {@link #getSingletonBean}, for the SPIs the request path iterates (component adapters, listing
   * exporters…). The set of beans is fixed once the container is up, so an empty answer IS
   * remembered.
   */
  @SuppressWarnings("unchecked")
  public static <T> Collection<T> getSingletonBeans(Class<T> clazz) {
    var memo = memo();
    var known = memo.collections.get(clazz);
    if (known != null) {
      return (Collection<T>) known;
    }
    var beans = memo.provider.getBeans(clazz);
    if (beans == null) {
      return List.of();
    }
    var copy = List.copyOf(beans);
    memo.collections.putIfAbsent(clazz, copy);
    return copy;
  }

  /** What was remembered, and for which provider. */
  private record Memo(
      BeanProvider provider,
      Map<Class<?>, Object> beans,
      Map<Class<?>, Collection<?>> collections) {
    Memo(BeanProvider provider) {
      this(provider, new ConcurrentHashMap<>(), new ConcurrentHashMap<>());
    }
  }

  private static volatile Memo memo;

  private static Memo memo() {
    var provider = provider();
    var current = memo;
    // compared on every read rather than reset by setBeanProvider alone: tests swap the provider
    // reflectively, and a memo outliving its provider would hand out another container's beans
    if (current == null || current.provider != provider) {
      current = new Memo(provider);
      memo = current;
    }
    return current;
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
