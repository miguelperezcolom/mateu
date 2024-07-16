package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.uidefinition.shared.data.Destination;
import io.mateu.core.domain.uidefinition.shared.data.DestinationType;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.remote.dtos.Step;

public class AbstractActionRunner {

  protected void addBackDestination(Result result, Step initialStep) {
    if (result.getNowTo() != null) {
      return;
    }
    result.setNowTo(
        new Destination(
            DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()));
  }
}
