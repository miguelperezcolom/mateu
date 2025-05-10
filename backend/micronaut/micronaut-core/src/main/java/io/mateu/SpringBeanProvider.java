package io.mateu;

import jakarta.inject.Singleton;

@Singleton
public class SpringBeanProvider implements BeanProvider {

  private final ApplicationContext applicationContext;

  public SpringBeanProvider(ApplicationContext applicationContext) {
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
