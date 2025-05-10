package io.mateu.core.domain;

import jakarta.inject.Named;

import java.util.Comparator;
import java.util.List;

@Named
public class DefaultUiMapperProvider implements UiMapperProvider {

  private final List<UiMapper> mappers;

  public DefaultUiMapperProvider(List<UiMapper> mappers) {
    this.mappers = mappers;
  }

  @Override
  public UiMapper get(Object instance) {
    return mappers.stream()
        .filter(mapper -> mapper.supports(instance))
        .min(Comparator.comparingInt(UiMapper::priority))
        .get();
  }
}
