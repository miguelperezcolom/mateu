package io.mateu;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import io.micronaut.context.ApplicationContext;
import io.micronaut.context.annotation.Context;
import jakarta.inject.Inject;
import java.util.Collection;
import java.util.List;

/**
 * Backs the static {@link MateuBeanProvider} facade with the application context. {@code @Context},
 * not a lazy singleton: the facade is read by generated code that cannot inject — a ROOT
 * {@code @UI}'s index asking {@link io.mateu.core.infra.YamlMounts#deepLinkIndex} which YAML mount
 * a deep link belongs to — and on a cold start nothing had instantiated this bean before that first
 * GET, so the facade answered "not initialized" and the root UI swallowed the mount's deep link.
 */
@Context
public class MicronautBeanProvider implements BeanProvider {

  private final ApplicationContext applicationContext;

  @Inject
  public MicronautBeanProvider(ApplicationContext applicationContext) {
    this.applicationContext = applicationContext;
    MateuBeanProvider.setBeanProvider(this);
  }

  /**
   * {@code findBean}, not {@code getBean}: Mateu asks for optional beans on every request (a
   * translator, an exporter, an adapter the app may not have), and a miss through {@code getBean}
   * builds a {@code NoSuchBeanException} whose message walks the whole context — candidate lookups
   * and DEBUG logging inside Micronaut's synchronized sections, which pin virtual threads on JDK
   * 21.
   */
  @Override
  public <T> T getBean(Class<T> clazz) {
    try {
      return applicationContext.findBean(clazz).orElse(null);
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
