package io.mateu.core.domain;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.commandmapper.CommandMapper.mapToCommandDtos;
import static io.mateu.core.domain.messagemapper.MessageMapper.mapToMessageDtos;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;

import io.mateu.core.domain.fragmentmapper.ComponentFragmentMapper;
import io.mateu.core.domain.fragmentmapper.ReflectionFragmentMapper;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MapsToDto;
import jakarta.inject.Named;
import java.net.URI;
import java.net.URL;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

@Named
@RequiredArgsConstructor
public class ReflectionUiIncrementMapper implements UiIncrementMapper {

  private final ComponentFragmentMapper componentFragmentMapper;
  private final ReflectionFragmentMapper reflectionFragmentMapper;

  @Override
  public boolean supports(Object instance) {
    return true;
  }

  @Override
  // todo: add metadata from the method annotations
  public Mono<UIIncrementDto> map(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance == null) {
      return Mono.empty();
    }
    if (instance instanceof UIIncrementDto uiIncrementDto) {
      return Mono.just(uiIncrementDto);
    }
    if (instance instanceof MapsToDto mapsToDto) {
      return Mono.just(mapsToDto.toUIIncrementDto());
    }
    if (instance instanceof Mono<?> mono) {
      return mono.flatMap(object -> map(object, baseUrl, route, initiatorComponentId, httpRequest));
    }
    return Mono.just(
        new UIIncrementDto(
            mapToCommands(instance, baseUrl, httpRequest),
            mapToMessages(instance, baseUrl, httpRequest),
            mapToFragments(instance, baseUrl, route, initiatorComponentId, httpRequest),
            Map.of(),
            Map.of()));
  }

  private List<UICommandDto> mapToCommands(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    return mapToCommandDtos(instance, baseUrl, httpRequest);
  }

  private List<MessageDto> mapToMessages(Object instance, String baseUrl, HttpRequest httpRequest) {
    return mapToMessageDtos(instance, baseUrl, httpRequest);
  }

  private List<UIFragmentDto> mapToFragments(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof Message) {
      return List.of();
    }
    if (instance instanceof UICommand) {
      return List.of();
    }
    if (instance instanceof URI || instance instanceof URL) {
      return List.of();
    }
    if (instance instanceof Collection<?> collection) {
      return collection.stream()
          .map(
              object ->
                  serializeData(
                      reflectionFragmentMapper.mapToFragment(
                          componentFragmentMapper.mapToFragment(
                              object, baseUrl, route, initiatorComponentId, httpRequest),
                          baseUrl,
                          route,
                          initiatorComponentId,
                          httpRequest)))
          .toList();
    }
    return List.of(
        serializeData(
            reflectionFragmentMapper.mapToFragment(
                componentFragmentMapper.mapToFragment(
                    instance, baseUrl, route, initiatorComponentId, httpRequest),
                baseUrl,
                route,
                initiatorComponentId,
                httpRequest)));
  }

  private UIFragmentDto serializeData(UIFragmentDto fragment) {
    return new UIFragmentDto(
        fragment.targetComponentId(),
        fragment.component(),
        toMap(fragment.state()),
        toMap(fragment.data()),
        UIFragmentActionDto.Replace);
  }

  @SneakyThrows
  private Object toMap(Object data) {
    if (data == null) {
      return null;
    }
    if (data instanceof Map) {
      return data;
    }
    if (isBasic(data)) {
      return data;
    }
    return fromJson(toJson(data));
    //return data;
  }
}
