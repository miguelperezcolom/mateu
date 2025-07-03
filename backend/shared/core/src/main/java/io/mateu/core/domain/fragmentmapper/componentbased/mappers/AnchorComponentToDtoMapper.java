package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.AnchorDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Anchor;
import java.util.List;

public class AnchorComponentToDtoMapper {

  public static ClientSideComponentDto mapAnchorToDto(Anchor anchor) {
    return new ClientSideComponentDto(
        new AnchorDto(anchor.text(), anchor.url()), "fieldId", List.of(), "", "");
  }
}
