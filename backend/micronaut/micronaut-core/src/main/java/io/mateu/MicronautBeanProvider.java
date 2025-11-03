package io.mateu;

import io.mateu.core.domain.ports.BeanProvider;
import io.micronaut.context.ApplicationContext;
import jakarta.inject.Singleton;
import java.util.Collection;
import java.util.List;

@Singleton
public class MicronautBeanProvider implements BeanProvider {

  private final ApplicationContext applicationContext;

  public MicronautBeanProvider(ApplicationContext applicationContext) {
    this.applicationContext = applicationContext;
  }

  @Override
  public <T> T getBean(Class<T> clazz) {
    try {
      return applicationContext.getBean(clazz);
    } catch (Exception ignored) {
      return null;
    }
  }

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    try {
      return applicationContext.getBeansOfType(clazz);
    } catch (Exception ignored) {
      System.out.println(ignored);
      return List.of();
    }
  }
}
