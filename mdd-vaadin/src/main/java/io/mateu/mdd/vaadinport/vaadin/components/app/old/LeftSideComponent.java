package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.app.AbstractApplication;

public class LeftSideComponent extends VerticalLayout {
    private final AbstractApplication app;

    public LeftSideComponent(AbstractApplication app) {
        this.app = app;

        addStyleName("leftside");

        setSizeUndefined();

        addComponent(new Label(app.getName()));


        addComponent(new SessionComponent());


        addComponent(new NavigationComponent(app));

    }



}
