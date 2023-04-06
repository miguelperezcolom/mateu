package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import lombok.Data;

@Data
public class ReturnsResult {

    private String name;

    private int age;

    @Action
    public Result doSomething() {
        return new Result(ResultType.Success, "It worked!", null, null);
    }

    @MainAction
    public Result doSomethingBig() {
        return new Result(ResultType.Info, "It worked, also!", null, null);
    }

}
