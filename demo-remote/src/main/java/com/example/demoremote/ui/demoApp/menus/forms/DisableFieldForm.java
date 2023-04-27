package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.EnabledIf;
import io.mateu.mdd.shared.annotations.VisibleIf;
import lombok.Data;

@Data@Caption("Disable field")
public class DisableFieldForm {

    private boolean enable;

    @EnabledIf("enable")
    private String whatever;

}
