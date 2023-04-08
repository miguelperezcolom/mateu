package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import lombok.Data;

@Data@Caption("Returns result")
public class ReturnsResult {

    private String name;

    private int age;

    @Action(confirmationTitle = "One moment, please",
            confirmationMessage = "Are you sure you want to do something?",
            confirmationAction = "Yes, I want!")
    public Result doSomething() {
        return new Result(ResultType.Success, "It worked!", null, null);
    }

    @MainAction(confirmationMessage = "Are you sure you want to do something BIG?")
    public Result doSomethingBig() {
        return new Result(ResultType.Info, "It worked, also!", null, null);
    }

}
