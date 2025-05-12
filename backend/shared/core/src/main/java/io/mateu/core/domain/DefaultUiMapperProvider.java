package io.mateu.core.domain;

import io.quarkus.arc.All;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.List;

@Named
public class DefaultUiMapperProvider implements UiMapperProvider {

  @All private final List<UiMapper> mappers;

  @Inject
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
