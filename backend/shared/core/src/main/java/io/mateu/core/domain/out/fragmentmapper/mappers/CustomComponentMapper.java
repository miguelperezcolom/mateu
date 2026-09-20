package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CustomComponentDto;
import io.mateu.uidl.data.CustomComponent;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Maps a {@link CustomComponent} (coherence-plan #14) to the wire. The type {@code name} + {@code
 * props} ride in the {@link CustomComponentDto} metadata; the slotted {@code content} travels as
 * ordinary children (the Notice/HeroSection pattern), so a custom shell can wrap known components.
 * No rendering is decided here — a renderer registers against {@code name} and degrades to {@code
 * <mateu-unsupported>} when it has no renderer for it.
 */
public class CustomComponentMapper {

  public static ClientSideComponentDto mapCustomComponentToDto(
      CustomComponent component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new CustomComponentDto(component.name(), component.props()),
        component.id(),
        component.content() != null
            ? component.content().stream()
                .map(
                    item ->
                        mapComponentToDto(
                            null,
                            item,
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest))
                .toList()
            : List.of(),
        null,
        null,
        null);
  }
}
