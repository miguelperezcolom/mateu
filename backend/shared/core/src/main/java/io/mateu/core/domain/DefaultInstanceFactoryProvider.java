package io.mateu.core.domain;

import io.quarkus.arc.All;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.List;

@Named
public class DefaultInstanceFactoryProvider implements InstanceFactoryProvider {

  @All private final List<InstanceFactory> factories;

  @Inject
  public DefaultInstanceFactoryProvider(List<InstanceFactory> factories) {
    this.factories = factories;
  }

  @Override
  public InstanceFactory get(String className) {
    return factories.stream()
        .filter(factory -> factory.supports(className))
        .min(Comparator.comparingInt(InstanceFactory::priority))
        .get();
  }
}
