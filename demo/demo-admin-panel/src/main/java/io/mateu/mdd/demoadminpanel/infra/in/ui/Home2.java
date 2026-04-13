package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
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

    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name);
    }

}
