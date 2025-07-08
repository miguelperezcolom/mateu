package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MicroFrontendDto;
import io.mateu.uidl.data.MicroFrontend;
import java.util.List;

public class MicroFrontendComponentToDtoMapper {

  public static ClientSideComponentDto mapMicroFrontendToDto(MicroFrontend microFrontend) {
    return new ClientSideComponentDto(
        new MicroFrontendDto(
            microFrontend.baseUrl(), microFrontend.route(), microFrontend.consumedRoute()),
        "fieldId",
        List.of(),
        microFrontend.style(),
        microFrontend.cssClasses());
  }
}
