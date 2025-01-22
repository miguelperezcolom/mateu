package io.mateu.uidl.data;

import io.mateu.uidl.interfaces.ActionHandler;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;

public record Result(
    @NotNull String title,
    @NotNull ResultType type,
    @NotNull String message,
    @NotNull List<Destination> interestingLinks,
    Destination nowTo,
    String leftSideImageUrl,
    ActionHandler actionHandler) {

  public Result {
    interestingLinks =
        interestingLinks != null ? Collections.unmodifiableList(interestingLinks) : List.of();
  }

  public Result(ResultType type, String message, Destination nowTo) {
    this("", type, message, List.of(), nowTo, "", null);
  }

  @Override
  public List<Destination> interestingLinks() {
    return Collections.unmodifiableList(interestingLinks);
  }
}
