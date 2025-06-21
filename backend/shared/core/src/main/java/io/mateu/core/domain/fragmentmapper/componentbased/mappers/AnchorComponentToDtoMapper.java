package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.AnchorDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.Anchor;
import java.util.List;

public class AnchorComponentToDtoMapper {

  public static ComponentDto mapAnchorToDto(Anchor anchor) {
    return new ComponentDto(new AnchorDto(anchor.text(), anchor.url()), "fieldId", null, List.of());
  }
}
