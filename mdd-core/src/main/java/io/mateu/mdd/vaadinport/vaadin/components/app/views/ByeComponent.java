package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;

public class ByeComponent extends VerticalLayout {

    @Override
    public String toString() {
        return "Bye";
    }

    public ByeComponent() {

        addStyleName("methodresultflowcomponent");

        addComponent(new Label("It's been nice to see you."));
        addComponent(new Label("Hace a nice day ;)"));
        addComponentsAndExpand(new Label(""));


    }

}
