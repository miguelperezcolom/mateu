package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Result(
        String dataPrefix,
        ResultType resultType,
        String message,
        List<Destination> interestingLinks,
        Destination nowTo,
        String leftSideImageUrl
) implements ViewMetadata {

  public Result {
    interestingLinks = Collections.unmodifiableList(interestingLinks);
  }

  @Override
  public List<Destination> interestingLinks() {
    return Collections.unmodifiableList(interestingLinks);
  }
}
