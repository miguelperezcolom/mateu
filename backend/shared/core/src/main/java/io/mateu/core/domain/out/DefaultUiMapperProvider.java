package io.mateu.core.domain.out;

import io.mateu.core.domain.ports.BeanProvider;
import jakarta.inject.Named;
import java.util.Comparator;

@Named
public class DefaultUiMapperProvider implements UiMapperProvider {

  private final BeanProvider beanProvider;

  public DefaultUiMapperProvider(BeanProvider beanProvider) {
    this.beanProvider = beanProvider;
  }

  @Override
  public UiMapper get(Object instance) {
    return beanProvider.getBeans(UiMapper.class).stream()
        .filter(mapper -> mapper.supports(instance))
        .min(Comparator.comparingInt(UiMapper::priority))
        .get();
  }
}
