
package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.SameLine;
import io.mateu.mdd.shared.annotations.VisibleIf;
import io.mateu.mdd.shared.annotations.Width;
import lombok.Data;

@Data@Caption("Same line")
public class SameLineForm {

    private String name;

    @SameLine
    @Width("200px")
    private int age;

    private String newLine;

    @SameLine
    private String sameLine;

    @SameLine
    private String sameLineAgain;

    private String fullWidth;

}
