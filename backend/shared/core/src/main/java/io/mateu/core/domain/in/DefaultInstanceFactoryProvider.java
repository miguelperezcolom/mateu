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

  @Override
  public InstanceFactory get(String className) {
    return beanProvider.getBeans(InstanceFactory.class).stream()
        .filter(factory -> factory.supports(className))
        .min(Comparator.comparingInt(InstanceFactory::priority))
        .get();
  }
}
