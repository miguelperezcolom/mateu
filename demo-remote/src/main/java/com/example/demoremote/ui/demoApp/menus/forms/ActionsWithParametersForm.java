
package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.SameLine;
import io.mateu.mdd.shared.annotations.Width;
import lombok.Data;

@Data
public class ActionsWithParametersForm {

    private String someText;

    private int someValue;

    @Action
    public void sayHello(String name, int age) {
        this.someText = name;
        this.someValue = age;
    }

}
