package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PlanningBlockDto;
import io.mateu.dtos.PlanningBoardDto;
import io.mateu.dtos.PlanningResourceDto;
import io.mateu.uidl.data.PlanningBoard;
import java.util.List;

public class PlanningBoardMapper {

  public static ClientSideComponentDto mapPlanningBoardToDto(PlanningBoard planningBoard) {
    return new ClientSideComponentDto(
        PlanningBoardDto.builder()
            .resources(
                planningBoard.resources() != null
                    ? planningBoard.resources().stream()
                        .map(
                            resource ->
                                PlanningResourceDto.builder()
                                    .id(resource.id())
                                    .label(resource.label())
                                    .group(resource.group())
                                    .build())
                        .toList()
                    : List.of())
            .blocks(
                planningBoard.blocks() != null
                    ? planningBoard.blocks().stream()
                        .map(
                            block ->
                                PlanningBlockDto.builder()
                                    .id(block.id())
                                    .resourceId(block.resourceId())
                                    .start(block.start() != null ? block.start().toString() : null)
                                    .end(block.end() != null ? block.end().toString() : null)
                                    .label(block.label())
                                    .color(block.color())
                                    .status(block.status())
                                    .build())
                        .toList()
                    : List.of())
            .from(planningBoard.from() != null ? planningBoard.from().toString() : null)
            .to(planningBoard.to() != null ? planningBoard.to().toString() : null)
            .moveActionId(planningBoard.moveActionId())
            .selectActionId(planningBoard.selectActionId())
            .build(),
        planningBoard.id(),
        List.of(),
        planningBoard.style(),
        planningBoard.cssClasses(),
        null);
  }
}
