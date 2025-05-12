package io.mateu.core.domain;

import jakarta.inject.Named;
import java.util.Comparator;

@Named
public class DefaultUiIncrementMapperProvider implements UiIncrementMapperProvider {

  private final BeanProvider beanProvider;

  public DefaultUiIncrementMapperProvider(BeanProvider beanProvider) {
    this.beanProvider = beanProvider;
  }

  @Override
  public UiIncrementMapper get(Object instance) {
    return beanProvider.getBeans(UiIncrementMapper.class).stream()
        .filter(mapper -> mapper.supports(instance))
        .min(Comparator.comparingInt(UiIncrementMapper::priority))
        .get();
  }
}
