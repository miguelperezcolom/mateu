package io.mateu;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import java.util.Collection;
import java.util.List;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
public class SpringBeanProvider implements BeanProvider {

  private final ApplicationContext applicationContext;

  public SpringBeanProvider(ApplicationContext applicationContext) {
    this.applicationContext = applicationContext;
    MateuBeanProvider.setBeanProvider(this);
  }

  @Override
  public <T> T getBean(Class<T> clazz) {
    // Try by exact bean name first to avoid NoUniqueBeanDefinitionException
    // when a subclass is also registered as a bean.
    String beanName =
        Character.toLowerCase(clazz.getSimpleName().charAt(0)) + clazz.getSimpleName().substring(1);
    try {
      Object candidate = applicationContext.getBean(beanName);
      if (candidate.getClass() == clazz) {
        return clazz.cast(candidate);
      }
    } catch (Exception ignored) {
    }
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
