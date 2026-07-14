package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FunnelDto;
import io.mateu.dtos.FunnelStageDto;
import io.mateu.uidl.data.Funnel;
import java.util.List;

public class FunnelMapper {

  public static ClientSideComponentDto mapFunnelToDto(Funnel funnel) {
    return new ClientSideComponentDto(
        FunnelDto.builder()
            .stages(
                funnel.stages() != null
                    ? funnel.stages().stream()
                        .map(
                            stage ->
                                FunnelStageDto.builder()
                                    .label(stage.label())
                                    .value(stage.value())
                                    .color(stage.color())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        funnel.id(),
        List.of(),
        funnel.style(),
        funnel.cssClasses(),
        null);
  }
}
