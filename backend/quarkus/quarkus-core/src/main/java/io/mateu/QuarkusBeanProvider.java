package io.mateu;

import io.mateu.core.domain.BeanProvider;
import jakarta.enterprise.inject.spi.BeanManager;
import jakarta.inject.Singleton;
import java.util.Collection;
import java.util.List;

@Singleton
public class QuarkusBeanProvider implements BeanProvider {

  private final BeanManager beanManager;

  public QuarkusBeanProvider(BeanManager beanManager) {
    this.beanManager = beanManager;
  }

  @Override
  public <T> T getBean(Class<T> clazz) {
    try {
      var bean = beanManager.getBeans(clazz).iterator().next();
      return (T) beanManager.getReference(bean, clazz, beanManager.createCreationalContext(bean));
    } catch (Exception ignored) {
      return null;
    }
  }

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    try {
      return (Collection<T>)
          beanManager.getBeans(clazz).stream()
              .map(
                  bean ->
                      beanManager.getReference(
                          bean, clazz, beanManager.createCreationalContext(bean)))
              .toList();
    } catch (Exception ignored) {
      return List.of();
    }
  }
}
