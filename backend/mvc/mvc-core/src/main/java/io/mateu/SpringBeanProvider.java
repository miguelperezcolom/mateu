package io.mateu;

import io.mateu.core.domain.ports.BeanProvider;
import java.util.Collection;
import java.util.List;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
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

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    try {
      return applicationContext.getBeansOfType(clazz).values();
    } catch (Exception ignored) {
      return List.of();
    }
  }
}
