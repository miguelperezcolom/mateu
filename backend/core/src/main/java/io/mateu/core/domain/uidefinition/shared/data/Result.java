package io.mateu.core.domain.uidefinition.shared.data;

import java.util.Collections;
import java.util.List;

public record Result(
    ResultType type,
    String message,
    List<Destination> interestingLinks,
    Destination nowTo,
    String leftSideImageUrl) {

  public Result {
    interestingLinks = interestingLinks != null?Collections.unmodifiableList(interestingLinks):List.of();
  }

  @Override
  public List<Destination> interestingLinks() {
    return Collections.unmodifiableList(interestingLinks);
  }
}
