package io.mateu.core.domain.in;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Comparator;

@Named
@Singleton
public class DefaultInstanceFactoryProvider implements InstanceFactoryProvider {

  private final BeanProvider beanProvider;

  @Inject
  public DefaultInstanceFactoryProvider(BeanProvider beanProvider) {
    this.beanProvider = beanProvider;
  }

  /**
   * The factories, asked for once: they are core and app singletons, and the container's {@code
   * getBeansOfType} on every request was a scan of every bean definition.
   */
  private volatile java.util.List<InstanceFactory> factories;

  private java.util.List<InstanceFactory> factories() {
    var known = factories;
    if (known == null) {
      known = java.util.List.copyOf(beanProvider.getBeans(InstanceFactory.class));
      factories = known;
    }
    return known;
  }

  @Override
  public InstanceFactory get(String className) {
    return factories().stream()
        .filter(factory -> factory.supports(className))
        .min(Comparator.comparingInt(InstanceFactory::priority))
        .get();
  }
}
