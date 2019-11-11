package io.mateu.mdd.vaadinport.vaadin.components.app.desktop;

import com.vaadin.server.Responsive;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.core.util.Pair;
import io.mateu.mdd.vaadinport.vaadin.components.app.AppComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.ViewContainer;

public class DesktopAppComponent extends VerticalLayout implements AppComponent {
    private final AbstractApplication app;
    private final LeftSideComponent left;
    private final ViewContainer viewContainer;

    public DesktopAppComponent(AbstractApplication app, ViewContainer viewContainer) {
        this.app = app;
        this.viewContainer = viewContainer;

        Responsive.makeResponsive(this);

        addStyleName("miapp");

        setSizeFull();

        setSpacing(false);


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

    public void minimizeLeftSide() {
        left.minimizar();
    }

    public void maximizeLeftSide() {
        left.maximizar();
    }

    public void toggleMenu() {
        if (getStyleName().contains("menuvisible")) removeStyleName("menuvisible");
        else addStyleName("menuvisible");
    }

    @Override
    public void setArea(AbstractArea a) {
        left.setArea(a);
    }

    @Override
    public void setCoordinates(Pair<AbstractArea, MenuEntry> coordinates) {
        unselectAll();
        AbstractArea area = coordinates.getA();
        MenuEntry menu = coordinates.getB();
        setArea(area);
        setMenu(menu);
    }

    private void setMenu(MenuEntry menu) {
        left.setMenu(menu);
    }

    @Override
    public void updateSession() {
        left.updateSession();
    }

    @Override
    public void updateTitle(String title) {
        viewContainer.updateTitle(title);
    }

    @Override
    public void setResettingPassword() {
        left.unselectAll();
    }

    @Override
    public void setSigningIn() {
        left.setSigningIn();
    }

    @Override
    public void setSearching() {
        left.setSearching();
    }

    public void unselectAll() {
        left.unselectAll();
    }

    @Override
    public void setSelectingArea() {
        left.setSelectingArea();
    }
}
