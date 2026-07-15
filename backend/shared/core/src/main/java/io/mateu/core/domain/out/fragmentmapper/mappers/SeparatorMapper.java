package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.SeparatorDto;
import io.mateu.uidl.data.Separator;
import java.util.List;

public class SeparatorMapper {

  public static ClientSideComponentDto mapSeparatorToDto(Separator separator) {
    return new ClientSideComponentDto(
        new SeparatorDto(separator.attributes()),
        separator.id(),
        List.of(),
        separator.style(),
        separator.cssClasses(),
        null);
  }
}
