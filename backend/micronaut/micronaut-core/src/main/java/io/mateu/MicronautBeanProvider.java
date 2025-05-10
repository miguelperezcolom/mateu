package io.mateu;

import io.mateu.core.domain.BeanProvider;
import io.micronaut.context.ApplicationContext;
import jakarta.inject.Singleton;

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
}
