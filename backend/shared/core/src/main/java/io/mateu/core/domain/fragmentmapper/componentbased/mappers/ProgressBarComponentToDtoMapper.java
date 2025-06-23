package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ProgressBarDto;
import io.mateu.uidl.data.ProgressBar;
import java.util.List;

public class ProgressBarComponentToDtoMapper {

  public static ComponentDto mapProgressBarToDto(ProgressBar progressBar) {
    return new ComponentDto(new ProgressBarDto(), "fieldId", null, List.of());
  }
}
