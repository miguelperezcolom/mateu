package io.mateu.workflow.demo1.infra.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

@UI("")
public class Home {

    String content = "Hello world";


    @Button
    void addContent() {
        content += "!";
    }

}
