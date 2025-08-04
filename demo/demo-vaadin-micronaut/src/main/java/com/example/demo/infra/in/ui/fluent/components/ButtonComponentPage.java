package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Icon;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;

import java.util.List;

@Route("/fluent-app/components/button")
public class ButtonComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Button")
                .content(List.of(

                        new Text("basic"),

                        Button.builder()
                                .label("Do something")
                                .build(),

                        new Text("primary"),

                        Button.builder()
                                .label("Do something")
                                .primary(true)
                                .build(),

                        new Text("icon on left"),

                        Button.builder()
                                .label("Do something")
                                .iconOnLeft(IconKey.ChevronLeft.iconName)
                                .build(),

                        new Text("icon on right"),

                        Button.builder()
                                .label("Do something")
                                .iconOnRight(IconKey.ChevronLeft.iconName)
                                .build(),

                        new Text("disabled"),

                        Button.builder()
                                .label("Do something")
                                .disabled(true)
                                .build(),

                        new Text("")
                        ))
                .build();
    }
}
