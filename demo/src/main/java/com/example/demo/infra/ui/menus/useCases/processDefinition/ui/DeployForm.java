package com.example.demo.infra.ui.menus.useCases.processDefinition.ui;

import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;

@Caption("Deploy to Camunda")
public class DeployForm {

  @MainAction
  public Result deployAll() {
    return new Result("Deployment result", ResultType.Success, "All products polled", null, null, null, null);
  }
}
