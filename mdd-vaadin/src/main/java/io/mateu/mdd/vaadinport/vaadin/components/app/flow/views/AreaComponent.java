package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.app.AbstractArea;

public class AreaComponent extends VerticalLayout {

    private final AbstractArea area;

    @Override
    public String toString() {
        return "Welcome to " + area.getName() + " area.";
    }

    public AreaComponent(AbstractArea area) {

        this.area = area;

        addStyleName("methodresultflowcomponent");

        //addComponent(new Label("It's been nice to see you."));
        //addComponent(new Label("Hace a nice day ;)"));
        addComponentsAndExpand(new Label(""));


    }

}
