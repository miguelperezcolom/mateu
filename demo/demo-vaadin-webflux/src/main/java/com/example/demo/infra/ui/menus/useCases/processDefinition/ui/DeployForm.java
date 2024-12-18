package com.example.demo.infra.ui.menus.useCases.processDefinition.ui;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.ResultType;

@Title("Deploy to Camunda")
public class DeployForm {

  @MainAction
  public Result deployAll() {
    return new Result("Deployment result", ResultType.Success, "All products polled", null, null, null, null);
  }
}
