package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.uidefinition.shared.data.Destination;
import io.mateu.core.domain.uidefinition.shared.data.DestinationType;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.dtos.Step;

public class AbstractActionRunner {

  protected Result addBackDestination(Result result, Step initialStep) {
    if (result.nowTo() != null) {
      return result;
    }
    return new Result(
        result.type(),
        result.message(),
        result.interestingLinks(),
        new Destination(
            DestinationType.ActionId, "Back to " + initialStep.name(), initialStep.id()),
        result.leftSideImageUrl());
  }
}
