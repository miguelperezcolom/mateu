package io.mateu.core.domain;

import jakarta.inject.Named;

import java.util.Comparator;
import java.util.List;

@Named
public class DefaultUiIncrementMapperProvider implements UiIncrementMapperProvider {

  private final List<UiIncrementMapper> mappers;

  public DefaultUiIncrementMapperProvider(List<UiIncrementMapper> mappers) {
    this.mappers = mappers;
  }

  @Override
  public UiIncrementMapper get(Object instance) {
    return mappers.stream()
        .filter(mapper -> mapper.supports(instance))
        .min(Comparator.comparingInt(UiIncrementMapper::priority))
        .get();
  }
}
