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
public record Result(
    String title,
    ResultType resultType,
    String message,
    List<Destination> interestingLinks,
    Destination nowTo,
    String leftSideImageUrl,
    ServerSideObject actionHandler)
    implements ComponentMetadata {

  public Result {
    interestingLinks =
        interestingLinks != null ? Collections.unmodifiableList(interestingLinks) : List.of();
  }

  @Override
  public List<Destination> interestingLinks() {
    return Collections.unmodifiableList(interestingLinks);
  }
}
