package io.mateu;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import java.util.Collection;
import java.util.List;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class SpringBeanProvider implements BeanProvider {

  private final ApplicationContext applicationContext;

  public SpringBeanProvider(ApplicationContext applicationContext) {
    this.applicationContext = applicationContext;
    MateuBeanProvider.setBeanProvider(this);
  }

  /** Warns, once, when nothing will authenticate callers (no Spring Security, no resolver). */
  @EventListener(ApplicationReadyEvent.class)
  public void warnAboutSecurity() {
    io.mateu.core.infra.security.IdentityResolver.warnOnStartup(
        io.mateu.core.infra.security.IdentityResolver.present(
            "org.springframework.security.core.Authentication"),
        "Add Spring Security (e.g. spring-boot-starter-oauth2-resource-server +"
            + " spring.security.oauth2.resourceserver.jwt.issuer-uri)");
  }

  @Override
  public <T> T getBean(Class<T> clazz) {
    // Try by exact bean name first to avoid NoUniqueBeanDefinitionException
    // when a subclass is also registered as a bean.
    String beanName =
        Character.toLowerCase(clazz.getSimpleName().charAt(0)) + clazz.getSimpleName().substring(1);
    //
    // Most lookups are for classes that are NOT beans (every view model and nested object Mateu
    // instantiates asks first), so ask without throwing: the two NoSuchBeanDefinitionExceptions
    // this
    // used to build and swallow per instantiation were pure overhead on the request path.
    try {
      if (applicationContext.containsBean(beanName)) {
        Object candidate = applicationContext.getBean(beanName);
        if (candidate.getClass() == clazz) {
          return clazz.cast(candidate);
        }
      }
    } catch (Exception ignored) {
    }
    try {
      // null when there is none, or several without a primary — what the catch below answered
      return applicationContext.getBeanProvider(clazz).getIfUnique();
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
