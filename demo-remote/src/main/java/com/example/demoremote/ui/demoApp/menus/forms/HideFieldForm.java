package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.VisibleIf;
import lombok.Data;

@Data@Caption("Hide field")
public class HideFieldForm {

    private boolean show;

    @VisibleIf("show")
    private String whatever;

}
