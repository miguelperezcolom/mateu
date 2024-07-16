package com.example.demo.infra.ui.menus.useCases.processDefinition.ui;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;

@Caption("Deploy to Camunda")
public class DeployForm {

  @MainAction
  public Result deployAll() {
    return new Result(ResultType.Success, "All products polled", null, null, null);
  }
}
