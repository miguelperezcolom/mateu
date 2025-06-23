package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MicroFrontendDto;
import io.mateu.uidl.data.MicroFrontend;
import java.util.List;

public class MicroFrontendComponentToDtoMapper {

  public static ComponentDto mapMicroFrontendToDto(MicroFrontend microFrontend) {
    return new ComponentDto(
        new MicroFrontendDto(
            microFrontend.baseUrl(), microFrontend.route(), microFrontend.consumedRoute()),
        "fieldId",
        null,
        List.of());
  }
}
