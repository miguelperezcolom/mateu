package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodResultViewComponent;

import java.lang.reflect.Method;

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
