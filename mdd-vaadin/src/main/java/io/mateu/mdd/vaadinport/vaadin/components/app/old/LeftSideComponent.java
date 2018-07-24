package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MenuEntry;

public class LeftSideComponent extends VerticalLayout {
    private final AbstractApplication app;
    private final AppComponent appComponent;
    private final NavigationComponent nav;
    private final SessionComponent ses;

    public LeftSideComponent(AppComponent appComponent, AbstractApplication app) {
        this.appComponent = appComponent;
        this.app = app;

        addStyleName("leftside");

        setSizeUndefined();


        addComponent(ses = new SessionComponent());


        addComponent(nav = new NavigationComponent(app));

        updateSession();

    }


    public void setArea(AbstractArea a) {
        nav.setArea(a);
    }

    public void updateSession() {
        ses.update();
        nav.setArea(null);
    }

    public void setMenu(MenuEntry menu) {
        nav.setMenu(menu);
    }
}
