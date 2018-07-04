package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.server.Responsive;
import com.vaadin.ui.CustomLayout;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.vaadinport.vaadin.components.views.ViewComponent;

public class AppComponent extends CustomLayout {
    private final AbstractApplication app;
    private final CenterComponent center;

    public AppComponent(AbstractApplication app) {

        super("app");

        this.app = app;


        Responsive.makeResponsive(this);

        addStyleName("miapp");

        setSizeFull();


        addComponent(new LeftSideComponent(app), "contenedornavegacion");

        addComponent(center = new CenterComponent(), "contenedorviews");

    }


    public void open(ViewComponent viewComponent) {
        center.open(viewComponent);
    }

    public AbstractApplication getApp() {
        return app;
    }

    public void clear() {
        center.removeAllComponents();
    }
}
