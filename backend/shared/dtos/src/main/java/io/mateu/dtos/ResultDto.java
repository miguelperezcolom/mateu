package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * Result metadata
 *
 * @param title The title
 * @param resultType The result type: error, success, info
 * @param message The message
 * @param interestingLinks A list of interesting links
 * @param nowTo The preferred destination
 * @param leftSideImageUrl An image to be shown on the left side
 */
public record ResultDto(
    String title,
    ResultTypeDto resultType,
    String message,
    List<DestinationDto> interestingLinks,
    DestinationDto nowTo,
    String leftSideImageUrl,
    ServerSideObjectDto actionHandler)
    implements ComponentMetadataDto {

  public ResultDto {
    interestingLinks =
        interestingLinks != null ? Collections.unmodifiableList(interestingLinks) : List.of();
  }

  @Override
  public List<DestinationDto> interestingLinks() {
    return Collections.unmodifiableList(interestingLinks);
  }
}
