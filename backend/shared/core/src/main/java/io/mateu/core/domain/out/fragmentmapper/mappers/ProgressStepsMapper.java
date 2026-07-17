package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ProgressStepsDto;
import io.mateu.dtos.StepDto;
import io.mateu.uidl.data.ProgressSteps;
import java.util.List;

public class ProgressStepsMapper {

  public static ClientSideComponentDto mapProgressStepsToDto(ProgressSteps steps) {
    return new ClientSideComponentDto(
        ProgressStepsDto.builder()
            .steps(
                steps.steps() != null
                    ? steps.steps().stream()
                        .map(
                            step ->
                                StepDto.builder()
                                    .id(step.id())
                                    .title(step.title())
                                    .description(step.description())
                                    .status(step.status())
                                    .build())
                        .toList()
                    : List.of())
            .vertical(steps.vertical())
            .build(),
        steps.id(),
        List.of(),
        steps.style(),
        steps.cssClasses(),
        null);
  }
}
