package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/** Planning board / tape chart metadata; from/to are ISO-8601 dates */
@Builder
public record PlanningBoardDto(
    List<PlanningResourceDto> resources,
    List<PlanningBlockDto> blocks,
    String from,
    String to,
    String moveActionId,
    String selectActionId,
    // headers of the attribute columns next to each resource (values in PlanningResourceDto)
    List<String> attributeColumns,
    // drag a block's edge → {_blockId, _resourceId, _start, _end}
    String resizeActionId,
    // double click on a block → {_blockId}
    String openActionId,
    // drag across empty cells of a resource → {_resourceId, _start, _end}
    String rangeSelectActionId)
    implements ComponentMetadataDto {

  public PlanningBoardDto {
    resources =
        Collections.unmodifiableList(resources != null ? resources : Collections.emptyList());
    blocks = Collections.unmodifiableList(blocks != null ? blocks : Collections.emptyList());
  }

  @Override
  public List<PlanningResourceDto> resources() {
    return Collections.unmodifiableList(resources);
  }

  @Override
  public List<PlanningBlockDto> blocks() {
    return Collections.unmodifiableList(blocks);
  }
}
