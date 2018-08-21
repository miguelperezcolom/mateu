package io.mateu.mdd.vaadinport.vaadin.components.app.mobile;

import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.core.util.Pair;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;

public class MobileAppComponent extends VerticalLayout implements AppComponent {

    private final AbstractApplication app;
    private final Component viewContainer;

    public MobileAppComponent(AbstractApplication app, Component viewContainer) {
        this.app = app;
        this.viewContainer = viewContainer;
        
        addComponent(viewContainer);
    }

    @Override
    public void setArea(AbstractArea a) {
        //MDD.info("Area has been set to " + a);
    }

    @Override
    public void setCoordinates(Pair<AbstractArea, MenuEntry> coordinates) {
        //MDD.info("Coordinates has been set to " + coordinates);
    }

    @Override
    public void updateSession() {
        //MDD.info("Session has been updated");
    }
}
