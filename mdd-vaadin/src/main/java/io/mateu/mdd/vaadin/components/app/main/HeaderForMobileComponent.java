package io.mateu.mdd.vaadin.components.app.main;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.*;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.MateuUI;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class HeaderForMobileComponent extends HorizontalLayout {

    private final MainComponent home;
    private AbstractArea area;
    private Label labelPosition;
    private HorizontalLayout positionLayout;
    private boolean isPrivate;
    private VerticalLayout barContainer;
    private Window ventanaMenu;


    public HeaderForMobileComponent(MainComponent home) {
        this.home = home;
        setWidthFull();
        addStyleName("mateu-header-mobile");
        App app = MDDUIAccessor.getApp();
        if (!app.getClass().isAnnotationPresent(FullWidth.class)) addStyleName("container");

        refresh(false);
    }

    public void refresh(boolean isPrivate) {
        removeAllComponents();

        this.isPrivate = isPrivate;

        App app = MDDUIAccessor.getApp();


        HorizontalLayout i = new HorizontalLayout();
        Label l;
        i.addComponent(l = new Label(VaadinIcons.MENU.getHtml(), ContentMode.HTML));
        l.addStyleName("iconomenu");
        l.addStyleName("clickable");
        addComponent(i);
        i.setHeight("37px");
        i.addLayoutClickListener(e -> openMenu());
        i.addStyleName("clickable");
        addComponent(positionLayout = new HorizontalLayout(labelPosition = new Label(app.getName())));
        labelPosition.addStyleName("appname");
        labelPosition.addStyleName("clickable");
        positionLayout.addStyleName(CSS.NOPADDING);
        positionLayout.addStyleName("centro");
        positionLayout.setSpacing(false);
        if (app.getAreas().length <= 1) positionLayout.addLayoutClickListener(e -> MDDUIAccessor.goTo(""));
        else positionLayout.addLayoutClickListener(e -> chooseArea());

        barContainer = new VerticalLayout();

        String basePath = UI.getCurrent().getUiRootPath();
        if (!basePath.endsWith("/")) basePath += "/";

        String finalBasePath = basePath;
        if (isPrivate) {
            Button b;
            addComponent(b = new Button("Logout", e -> Page.getCurrent().setLocation(finalBasePath + "private/logout")));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
        } else {
            if (app.hasPrivateContent()) {
                Button b;
                if (app.hasRegistrationForm()) {
                    addComponent(b = new Button("Registrarse", e -> Page.getCurrent().setLocation(finalBasePath + "private/register")));
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                }
                addComponent(b = new Button("Login", e -> Page.getCurrent().setLocation(finalBasePath + "private")));
                b.addStyleName(ValoTheme.BUTTON_QUIET);
            }
        }

        setExpandRatio(positionLayout, 1);

        List<IArea> areas = Arrays.asList(app.getAreas()).stream().filter(a -> (!isPrivate && a.isPublicAccess()) || (isPrivate && !a.isPublicAccess())).collect(Collectors.toList());
        if (areas.size() > 0) setArea((AbstractArea) areas.get(0));

    }

    private void openMenu() {
        Window w = new Window("Please select a work area");
        w.addStyleName("mateu");
        w.addStyleName("menulateral");
        w.setWidth("300px");
        w.setHeight("100%");
        CssLayout lx = new CssLayout();
        lx.addStyleName("maincomponent");
        lx.addStyleName("selectarea");

        lx.addComponent(barContainer);

        w.setContent(lx);
        w.center();
        //w.setModal(true);
        UI.getCurrent().addWindow(w);

        VerticalLayout fondo = new VerticalLayout();
        fondo.addStyleName("fondomenu");
        MateuUI.get().getMain().addComponent(fondo);
        fondo.addLayoutClickListener(e -> {
            w.close();
        });

        w.addCloseListener(e -> {
            MateuUI.get().getMain().removeComponent(fondo);
            ventanaMenu = null;
        });

        ventanaMenu = w;
    }

    private void chooseArea() {

        Window w = new Window("Please select a work area");
        w.addStyleName("mateu");
        w.setWidth("80%");
        w.setHeight("80%");
        CssLayout lx = new CssLayout();
        lx.addStyleName("maincomponent");
        lx.addStyleName("selectarea");
        App app = MDDUIAccessor.getApp();
        List<IArea> areas = Arrays.asList(app.getAreas()).stream().filter(a -> (!isPrivate && a.isPublicAccess()) || (isPrivate && !a.isPublicAccess())).collect(Collectors.toList());
        for (IArea a : areas) {

            Button b;
            lx.addComponent(b = new Button(a.getName()));
            if (!VaadinIcons.ADOBE_FLASH.equals(a.getIcon())) b.setIcon(a.getIcon());
            b.addClickListener((e) -> {
                w.close();
                home.irA(app.getState(a));
            });
            b.setPrimaryStyleName("huge");
            b.addStyleName("submenuoption");

        }

        w.setContent(lx);
        w.center();
        w.setModal(true);

        UI.getCurrent().addWindow(w);

    }


    public void refreshMenuBar() {

        App app = MDDUIAccessor.getApp();

        barContainer.removeAllComponents();

        List<IArea> areas = Arrays.asList(app.getAreas()).stream().filter(a -> (!isPrivate && a.isPublicAccess()) || (isPrivate && !a.isPublicAccess())).collect(Collectors.toList());
        if (area == null && areas.size() > 0) area = ((AbstractArea) areas.get(0));
        if (area != null) {
            for (IModule module : area.getModules()) {
                addMenu(app, barContainer, module);
            }
        }

    }

    private void addMenu(App app, VerticalLayout menubar, IModule module) {
        for (MenuEntry entry : module.getMenu()) {
            if (entry instanceof AbstractMenu) {
                Button b;
                menubar.addComponent(b = new Button(entry.getCaption(), e -> {
                    addSubmenu(app, menubar, (AbstractMenu) entry);
                }));
                b.addStyleName("botonmenu");
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                if (!VaadinIcons.ADOBE_FLASH.equals(entry.getIcon())) b.setIcon(entry.getIcon());
            } else if (entry instanceof AbstractAction) {
                Button b;
                menubar.addComponent(b = new Button(entry.getCaption(), e -> {
                    cerrarMenu();
                    home.irA(app.getState(entry));
                }));
                b.addStyleName("botonmenu");
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                if (!VaadinIcons.ADOBE_FLASH.equals(entry.getIcon())) b.setIcon(entry.getIcon());
            }
            //file.addSeparator();
        }

    }

    private void cerrarMenu() {
        if (ventanaMenu != null) ventanaMenu.close();
    }

    private void addSubmenu(App app, VerticalLayout menubar, AbstractMenu entries) {
        List<Component> old = new ArrayList<>();
        for (int i = 0; i < menubar.getComponentCount(); i++) old.add(menubar.getComponent(i));
        menubar.removeAllComponents();
        {
            Button b;
            menubar.addComponent(b = new Button("Back", e -> {
                menubar.removeAllComponents();
                old.forEach(c -> menubar.addComponentsAndExpand(c));
            }));
            b.addStyleName("botonmenu");
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.setIcon(VaadinIcons.CHEVRON_LEFT);

        }
        for (MenuEntry entry : entries.getEntries()) {
            if (entry instanceof AbstractMenu) {
                Button b;
                menubar.addComponent(b = new Button(entry.getCaption(), e -> {
                    menubar.removeAllComponents();
                    addSubmenu(app, menubar, (AbstractMenu) entry);
                }));
                b.addStyleName("botonmenu");
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                if (!VaadinIcons.ADOBE_FLASH.equals(entry.getIcon())) b.setIcon(entry.getIcon());
            } else if (entry instanceof AbstractAction) {
                Button b;
                menubar.addComponent(b = new Button(entry.getCaption(), e -> {
                    cerrarMenu();
                    home.irA(app.getState(entry));
                }));
                b.addStyleName("botonmenu");
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                if (!VaadinIcons.ADOBE_FLASH.equals(entry.getIcon())) b.setIcon(entry.getIcon());
            }

        }
    }


    public void setArea(AbstractArea area) {
        this.area = area;
        if (!(Strings.isNullOrEmpty(area.getName()))) {
            labelPosition.setValue(area.getName());
            positionLayout.removeAllComponents();
            Label l;
            positionLayout.addComponent(l = new Label(VaadinIcons.GRID_SMALL.getHtml(), ContentMode.HTML));
            l.addStyleName("iconoarea");
            l.addStyleName("clickable");
            positionLayout.addComponent(labelPosition);
        }
        refreshMenuBar();
    }
}
