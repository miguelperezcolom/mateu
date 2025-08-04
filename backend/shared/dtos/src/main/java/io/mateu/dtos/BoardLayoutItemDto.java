package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** A tab */
@Builder
public record BoardLayoutItemDto(List<ClientSideComponentDto> content, int boardCols)
    implements ComponentMetadataDto {}
