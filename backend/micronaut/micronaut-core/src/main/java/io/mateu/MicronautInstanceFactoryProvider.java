package io.mateu;

import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.micronaut.context.annotation.Primary;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.List;

@Named
@Primary
public class MicronautInstanceFactoryProvider implements InstanceFactoryProvider {

  private final List<InstanceFactory> factories;

  public MicronautInstanceFactoryProvider(List<InstanceFactory> factories) {
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
