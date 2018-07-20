package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.server.Responsive;
import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.core.util.Pair;

public class AppComponent extends VerticalLayout {
    private final AbstractApplication app;
    private final LeftSideComponent left;
    private final HeaderComponent top;
    private final Component viewContainer;

    public AppComponent(AbstractApplication app, Component viewContainer) {
        this.app = app;
        this.viewContainer = viewContainer;

        Responsive.makeResponsive(this);

        addStyleName("miapp");

        setSizeFull();

        setSpacing(false);


        addComponent(top = new HeaderComponent(this, app));

        HorizontalLayout h = new HorizontalLayout();
        h.setSpacing(false);
        h.setStyleName("horizontallayout");
        h.setSizeFull();

        h.addComponent(left = new LeftSideComponent(this, app));

        h.addComponentsAndExpand(viewContainer);

        addComponentsAndExpand(h);

    }



    public AbstractApplication getApp() {
        return app;
    }


    public void toggleMenu() {
        if (getStyleName().contains("menuvisible")) removeStyleName("menuvisible");
        else addStyleName("menuvisible");
    }

    public void setArea(AbstractArea a) {
        left.setArea(a);
    }

    public void setCoordinates(Pair<AbstractArea,MenuEntry> coordinates) {
        AbstractArea area = coordinates.getA();
        MenuEntry menu = coordinates.getB();
        setArea(area);
        setMenu(menu);
    }

    private void setMenu(MenuEntry menu) {
        left.setMenu(menu);
    }

    public void updateSession() {
        top.updateSession();
        left.updateSession();
    }
}
