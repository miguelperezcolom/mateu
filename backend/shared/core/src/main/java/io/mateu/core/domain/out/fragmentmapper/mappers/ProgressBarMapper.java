package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ProgressBarDto;
import io.mateu.uidl.data.ProgressBar;
import java.util.List;

public class ProgressBarMapper {

  public static ClientSideComponentDto mapProgressBarToDto(ProgressBar progressBar) {
    return new ClientSideComponentDto(
        new ProgressBarDto(
            progressBar.indeterminate(),
            progressBar.min(),
            progressBar.max(),
            progressBar.value(),
            progressBar.valueKey(),
            progressBar.text(),
            progressBar.theme()),
        WireIds.idOf(progressBar, null),
        List.of(),
        progressBar.style(),
        progressBar.cssClasses(),
        null);
  }
}
