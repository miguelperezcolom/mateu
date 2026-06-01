package io.mateu.workflow.demo1.infra.ui;

import io.mateu.uidl.annotations.*;

@UI("")
@FormLayout(columns = 1)
public class Home {

    String content = "Hello world";

    int age;

    boolean active;


    @Button
    void addContent() {
        content += "!";
    }

}
