package io.mateu;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import jakarta.enterprise.inject.Any;
import jakarta.enterprise.inject.spi.Bean;
import jakarta.enterprise.inject.spi.BeanManager;
import jakarta.inject.Singleton;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.List;

@Singleton
public class QuarkusBeanProvider implements BeanProvider {

  private final BeanManager beanManager;

  public QuarkusBeanProvider(BeanManager beanManager) {
    this.beanManager = beanManager;
    MateuBeanProvider.setBeanProvider(this);
  }

  @Override
  public <T> T getBean(Class<T> clazz) {
    var beans = resolve(clazz);
    if (beans.isEmpty()) {
      return null;
    }
    return reference(beans.iterator().next());
  }

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    return resolve(clazz).stream().<T>map(this::reference).toList();
  }

  /**
   * Resolve all beans assignable to {@code clazz}. First the direct CDI typesafe lookup (fast path,
   * identical to plain {@code getBeans(clazz)} for non-generic types); if that finds nothing — as
   * happens for a parameterized bean such as {@code ComponentAdapter<Foo>} queried by the raw
   * {@code ComponentAdapter.class} — fall back to scanning every bean and filtering by raw type.
   */
  private Collection<Bean<?>> resolve(Class<?> clazz) {
    try {
      var direct = beanManager.getBeans(clazz);
      if (!direct.isEmpty()) {
        return direct;
      }
      return beanManager.getBeans(Object.class, Any.Literal.INSTANCE).stream()
          .filter(bean -> bean.getTypes().stream().anyMatch(t -> rawAssignable(clazz, t)))
          .<Bean<?>>map(bean -> bean)
          .toList();
    } catch (Exception ignored) {
      return List.of();
    }
  }

  /**
   * Obtain the contextual reference as Object and cast — avoids a beanType-mismatch when the bean's
   * declared type is parameterized but we hold only the raw class.
   */
  @SuppressWarnings("unchecked")
  private <T> T reference(Bean<?> bean) {
    try {
      return (T)
          beanManager.getReference(bean, Object.class, beanManager.createCreationalContext(bean));
    } catch (Exception ignored) {
      return null;
    }
  }

  private static boolean rawAssignable(Class<?> required, Type beanType) {
    Class<?> raw = null;
    if (beanType instanceof Class<?> c) {
      raw = c;
    } else if (beanType instanceof ParameterizedType p && p.getRawType() instanceof Class<?> c) {
      raw = c;
    }
    return raw != null && required.isAssignableFrom(raw);
  }
}
