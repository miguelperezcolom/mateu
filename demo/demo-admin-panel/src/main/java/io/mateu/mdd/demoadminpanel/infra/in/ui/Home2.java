package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.RemoteMenu;
import jakarta.validation.constraints.NotEmpty;

@UI("/home2")
@Title("My first Mateu app")
@Style(StyleConstants.CONTAINER)
public class Home2 {

    @Menu
    Products products;

    @Menu
    NestedApp nestedApp;

    @Menu
    String xxx;

    @Menu
    RemoteMenu workflow = new RemoteMenu("http://localhost:8105/_workflow")
            .withAppServerSideType("io.mateu.workflow.infra.in.ui.WorkflowHome");



    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name);
    }

}
