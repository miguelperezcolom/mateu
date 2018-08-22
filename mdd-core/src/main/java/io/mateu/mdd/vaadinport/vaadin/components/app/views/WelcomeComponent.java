package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;

public class WelcomeComponent extends VerticalLayout {

    @Override
    public String toString() {
        return "Hello " + MDD.getUserData().getName();
    }

    public WelcomeComponent() {

        addStyleName("methodresultflowcomponent");

        addComponent(new Label("It's nice to see you."));
        addComponent(new Label("Let's have some fun ;)"));
        addComponentsAndExpand(new Label(""));


    }

}
