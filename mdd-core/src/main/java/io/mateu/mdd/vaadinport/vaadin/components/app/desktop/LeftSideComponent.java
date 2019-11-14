package io.mateu.mdd.vaadinport.vaadin.components.app.desktop;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.MouseOverVerticalLayout;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class LeftSideComponent extends MouseOverVerticalLayout {
    private final Button appTitle;
    private AbstractApplication app;
    private final DesktopAppComponent appComponent;
    private final NavigationComponent nav;
    private final SessionComponent ses;
    private final Button botonMinimizar;
    private final VerticalLayout versionFull;

    public LeftSideComponent(DesktopAppComponent appComponent, AbstractApplication app) {
        this.appComponent = appComponent;
        this.app = app;

        addStyleName("leftside");

        setSizeUndefined();


        /*
        VERSIÓN DESKTOP
         */

        AbsoluteLayout contenedor = new AbsoluteLayout();
        contenedor.addStyleName(CSS.NOPADDING);
        contenedor.addStyleName("contenedorizda");
        contenedor.setSizeFull();


        versionFull = new VerticalLayout();
        versionFull.addStyleName("full");
        versionFull.addStyleName(CSS.NOPADDING);
        versionFull.setSpacing(false);

        AbsoluteLayout al = new AbsoluteLayout();
        al.addStyleName(CSS.NOPADDING);
        al.setWidth("210px");
        al.setHeight("30px");

        al.addComponent(appTitle = new Button(app.getName()), "left: 50%; top: 0px;");
        appTitle.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
        appTitle.addStyleName("appTitle");
        appTitle.addClickListener(e -> {
            MDDUI.get().getNavegador().doAfterCheckSaved(() -> {
                unselectAll();
                MDDUI.get().getNavegador().goTo("");
            });
        });

        al.addComponent(botonMinimizar = new Button(VaadinIcons.MINUS, e -> minimizar()), "left: 190px; top: 0px;");
        botonMinimizar.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
        botonMinimizar.addStyleName("botonminimizar");

        VerticalLayout vlz;
        versionFull.addComponent(vlz = new VerticalLayout(al, ses = new SessionComponent(appComponent)));
        vlz.addStyleName(CSS.NOPADDING);
        vlz.addStyleName("conborde");

        versionFull.addComponent(nav = new NavigationComponent(app));

        Panel ll;
        versionFull.addComponent(ll = new Panel());
        ll.addStyleName(ValoTheme.PANEL_BORDERLESS);
        ll.addStyleName("conborde");
        ll.setHeight("1500px");
        ll.setWidth("211px");

        versionFull.setSizeFull();


        contenedor.addComponent(versionFull, "right: 0px;");


        addComponent(contenedor);

        updateSession();

        maximizar();
    }

    public void minimizar() {
        if (!getStyleName().contains("minimizada")) {
            //removeAllComponents();
            //addComponent(versionMinimizada);
            addStyleName("minimizada");
            JavaScript.getCurrent().execute("window.setTimeout(function() { $('.leftside').addClass('mouseoveractivo'); window.pingserver(); }, 400);");
        }
    }

    public void maximizar() {
        if (getStyleName().contains("minimizada")) {
            //removeAllComponents();
            //addComponent(versionFull);
            removeStyleName("minimizada");
            JavaScript.getCurrent().execute("$('.leftside').removeClass('mouseoveractivo');");
        }
    }


    public void setArea(AbstractArea a) {
        nav.setArea(a);
    }

    public void updateSession() {
        app = MDD.getApp();
        ses.update();
        appTitle.setCaption(app.getName());
        nav.setApp(app);
    }

    public void setMenu(MenuEntry menu) {
        nav.setMenu(menu);
    }

    @Override
    public void mousedOver() {
        maximizar();
    }

    public void unselectAll() {
        ses.unselectAll();
        nav.unselectAll();
    }

    public void setSigningIn() {
        unselectAll();
        ses.setSigningIn();
    }

    public void setSearching() {
        unselectAll();
        nav.setSearching();
    }

    public void setSelectingArea() {
        unselectAll();
        nav.setSelectingArea();
    }
}
