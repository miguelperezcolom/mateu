package io.mateu.core.domain;

import io.mateu.dtos.MessageDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MapsToDto;
import jakarta.inject.Named;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Named
@RequiredArgsConstructor
public class ReflectionUiIncrementMapper implements UiIncrementMapper {

  private final FragmentMapper fragmentMapper;

  @Override
  public boolean supports(Object instance) {
    return true;
  }

  @Override
  // todo: add metadata from the method annotations
  public Mono<UIIncrementDto> map(
      Object instance, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    if (instance == null) {
      return Mono.empty();
    }
    if (instance instanceof UIIncrementDto uiIncrementDto) {
      return Mono.just(uiIncrementDto);
    }
    if (instance instanceof MapsToDto mapsToDto) {
      return Mono.just(mapsToDto.toUIIncrementDto());
    }
    return Mono.just(
        new UIIncrementDto(
            mapToCommands(instance, baseUrl, httpRequest),
            mapToMessages(instance, baseUrl, httpRequest),
            mapToFragments(instance, baseUrl, initiatorComponentId, httpRequest),
            Map.of(),
            Map.of()));
  }

  private List<UICommandDto> mapToCommands(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    return List.of();
  }

  private List<MessageDto> mapToMessages(Object instance, String baseUrl, HttpRequest httpRequest) {
    return List.of();
  }

  private List<UIFragmentDto> mapToFragments(
      Object instance, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    return fragmentMapper.mapToFragments(instance, baseUrl, initiatorComponentId, httpRequest);
  }
}
