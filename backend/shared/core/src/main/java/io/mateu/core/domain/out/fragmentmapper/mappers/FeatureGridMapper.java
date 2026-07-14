package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FeatureDto;
import io.mateu.dtos.FeatureGridDto;
import io.mateu.uidl.data.FeatureGrid;
import java.util.List;

public class FeatureGridMapper {

  public static ClientSideComponentDto mapFeatureGridToDto(FeatureGrid grid) {
    return new ClientSideComponentDto(
        FeatureGridDto.builder()
            .columns(grid.columns())
            .features(
                grid.features() != null
                    ? grid.features().stream()
                        .map(
                            feature ->
                                FeatureDto.builder()
                                    .icon(feature.icon())
                                    .title(feature.title())
                                    .description(feature.description())
                                    .actionId(feature.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        grid.id(),
        List.of(),
        grid.style(),
        grid.cssClasses(),
        null);
  }
}
