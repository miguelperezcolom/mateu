package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Result(
    String dataPrefix,
    ResultType resultType,
    String message,
    List<Destination> interestingLinks,
    Destination nowTo,
    String leftSideImageUrl)
    implements ViewMetadata {

  public Result {
    interestingLinks = interestingLinks != null?Collections.unmodifiableList(interestingLinks):List.of();
  }

  @Override
  public List<Destination> interestingLinks() {
    return Collections.unmodifiableList(interestingLinks);
  }
}
