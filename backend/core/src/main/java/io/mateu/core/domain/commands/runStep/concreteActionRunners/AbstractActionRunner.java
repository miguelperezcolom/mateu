package io.mateu.core.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
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
