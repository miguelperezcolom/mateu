package io.mateu;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import jakarta.enterprise.inject.Instance;
import jakarta.enterprise.inject.Vetoed;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.stream.StreamSupport;

@Vetoed
@Named
public class HelidonMPInstanceFactoryProvider implements InstanceFactoryProvider {

  private final Instance<InstanceFactory> factories;

  @Inject
  public HelidonMPInstanceFactoryProvider(Instance<InstanceFactory> factories) {
    this.factories = factories;
  }

  @Override
  public InstanceFactory get(String className) {
    return StreamSupport.stream(factories.spliterator(), false)
        .filter(factory -> factory.supports(className))
        .min(Comparator.comparingInt(InstanceFactory::priority))
        .get();
  }
}
