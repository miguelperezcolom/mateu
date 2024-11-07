package com.example.demo.infra.ui.menus.useCases.processDefinition.ui;

import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.MainAction;
import io.mateu.uidl.core.data.Result;
import io.mateu.uidl.core.data.ResultType;

@Caption("Deploy to Camunda")
public class DeployForm {

  @MainAction
  public Result deployAll() {
    return new Result("Deployment result", ResultType.Success, "All products polled", null, null, null, null);
  }
}
