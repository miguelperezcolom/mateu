package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.ResultType;
import lombok.Data;

@Data
@Caption("Returns result")
public class ReturnsResult {

  private String name;

  private int age;

  @Action(
      confirmationTitle = "One moment, please",
      confirmationMessage = "Are you sure you want to do something?",
      confirmationAction = "Yes, I want!")
  public Result doSomething() {
    return new Result("You did something", ResultType.Success, "It worked!", null, null, null, null);
  }

  @MainAction(confirmationMessage = "Are you sure you want to do something BIG?")
  public Result doSomethingBig() {
    return new Result("You did something big", ResultType.Info, "It worked, also!", null, null, null, null);
  }
}
