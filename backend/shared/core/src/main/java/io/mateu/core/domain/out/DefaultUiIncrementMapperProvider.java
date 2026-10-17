package io.mateu.core.domain.out;

import io.mateu.core.domain.ports.BeanProvider;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Comparator;

@Named
@Singleton
public class DefaultUiIncrementMapperProvider implements UiIncrementMapperProvider {

  private final BeanProvider beanProvider;

  @Inject
  public DefaultUiIncrementMapperProvider(BeanProvider beanProvider) {
    this.beanProvider = beanProvider;
  }

  /**
   * The mappers, asked for once: they are core and app singletons, and the container's {@code
   * getBeansOfType} on every request was a scan of every bean definition.
   */
  private volatile java.util.List<UiIncrementMapper> mappers;

  private java.util.List<UiIncrementMapper> mappers() {
    var known = mappers;
    if (known == null) {
      known = java.util.List.copyOf(beanProvider.getBeans(UiIncrementMapper.class));
      mappers = known;
    }
    return known;
  }

  @Override
  public UiIncrementMapper get(Object instance) {
    return mappers().stream()
        .filter(mapper -> mapper.supports(instance))
        .min(Comparator.comparingInt(UiIncrementMapper::priority))
        .get();
  }
}
