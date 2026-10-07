package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.NotFoundDto;
import io.mateu.uidl.data.NotFound;
import java.util.List;

public class NotFoundMapper {

  public static ClientSideComponentDto mapNotFoundToDto(NotFound notFound) {
    return new ClientSideComponentDto(
        NotFoundDto.builder()
            .title(notFound.title())
            .message(notFound.message())
            .backRoute(notFound.backRoute())
            .backLabel(notFound.backLabel())
            .build(),
        notFound.id(),
        List.of(),
        notFound.style(),
        notFound.cssClasses(),
        null);
  }
}
