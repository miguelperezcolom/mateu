package io.mateu.mdd.vaadin.components.app.main;

import com.google.common.base.Strings;
import com.vaadin.event.FocusShortcut;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.*;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class HeaderComponent extends HorizontalLayout {

    private final MainComponent home;
    private AbstractArea area;
    private Label labelPosition;
    private HorizontalLayout positionLayout;
    private boolean isPrivate;
    private CssLayout barContainer;
    private MenuSearcher menuSearcher;


    public HeaderComponent(MainComponent home) {
        this.home = home;
        setWidthFull();
        addStyleName("mateu-header");
        setHeight("80px");

        refresh(false);
    }

    public void refresh(boolean isPrivate) {
        removeAllComponents();

        this.isPrivate = isPrivate;

        App app = MDDUIAccessor.getApp();


        HorizontalLayout left = new HorizontalLayout();
        HorizontalLayout center = new HorizontalLayout();
        HorizontalLayout right = new HorizontalLayout();
        left.addStyleName(CSS.NOPADDING);
        center.addStyleName(CSS.NOPADDING);
        right.addStyleName(CSS.NOPADDING);



        String logo = app.getLogo();
        Image i;
        Resource resource = new ThemeResource("img/logomateu2.png");
        if (!Strings.isNullOrEmpty(logo)) {
            if (logo.contains(":")) {
                resource = new ExternalResource(logo);
            } else {
                if (!logo.startsWith("/")) logo = "/" + logo;
                if (!logo.startsWith("/VAADIN")) logo = "/VAADIN" + logo;
                resource = new ClassResource(logo);
            }
        }
        left.addComponent(i = new Image(null, resource));
        i.setHeight("28px");
        i.addClickListener(e -> MDDUIAccessor.goTo(""));
        i.addStyleName("clickable");
        left.addComponent(positionLayout = new HorizontalLayout(labelPosition = new Label(app.getName())));
        labelPosition.addStyleName("appname");
        labelPosition.addStyleName("clickable");
        positionLayout.addStyleName(CSS.NOPADDING);
        positionLayout.setSpacing(false);
        if (app.getAreas().length <= 1) positionLayout.addLayoutClickListener(e -> MDDUIAccessor.goTo(""));
        else positionLayout.addLayoutClickListener(e -> chooseArea());

        center.addComponent(barContainer = new CssLayout());
        barContainer.addStyleName(CSS.NOPADDING);


        String basePath = UI.getCurrent().getUiRootPath();
        if (!basePath.endsWith("/")) basePath += "/";

        menuSearcher = new MenuSearcher((AbstractApplication) app);
        if (false) right.addComponent(menuSearcher = new MenuSearcher((AbstractApplication) app));

        String finalBasePath = basePath;
        if (isPrivate) {
            Button b;
            right.addComponent(b = new Button("Logout", e -> Page.getCurrent().setLocation(finalBasePath + "private/logout")));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
        } else {
            if (app.hasPrivateContent()) {
                Button b;
                if (app.hasRegistrationForm()) {
                    right.addComponent(b = new Button("Registrarse", e -> Page.getCurrent().setLocation(finalBasePath + "private/register")));
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                }
                right.addComponent(b = new Button("Login", e -> Page.getCurrent().setLocation(finalBasePath + "private")));
                b.addStyleName(ValoTheme.BUTTON_QUIET);
            } else right.addComponent(new Label(" "));
        }

        addComponents(left, center, right);

        setComponentAlignment(left, Alignment.MIDDLE_LEFT);
        setComponentAlignment(right, Alignment.MIDDLE_RIGHT);
        setComponentAlignment(center, Alignment.MIDDLE_CENTER);
        setExpandRatio(left, 0.5f);
        setExpandRatio(center, 1);
        setExpandRatio(right, 0.5f);

        List<IArea> areas = Arrays.asList(app.getAreas()).stream().filter(a -> (!isPrivate && a.isPublicAccess()) || (isPrivate && !a.isPublicAccess())).collect(Collectors.toList());
        if (areas.size() > 0) setArea((AbstractArea) areas.get(0));

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

        MenuBar menubar = new MenuBar();
        menubar.addStyleName(ValoTheme.MENUBAR_BORDERLESS);

        List<IArea> areas = Arrays.asList(app.getAreas()).stream().filter(a -> (!isPrivate && a.isPublicAccess()) || (isPrivate && !a.isPublicAccess())).collect(Collectors.toList());
        if (area == null && areas.size() > 0) area = ((AbstractArea) areas.get(0));
        if (area != null) {
            for (IModule module : area.getModules()) {
                addMenu(app, menubar, module);
            }
        } else {
            areas.forEach(area -> addMenu(app, menubar, area));
        }

        menubar.addShortcutListener(new FocusShortcut(menubar, ShortcutAction.KeyCode.F1));

        barContainer.addComponent(menubar);
    }

    private void addMenu(App app, MenuBar menubar, IModule module) {
        for (MenuEntry entry : module.getMenu()) {
            if (entry instanceof AbstractMenu) {
                MenuBar.MenuItem submenu = menubar.addItem(entry.getCaption(), null);
                addSubmenu(app, submenu, (AbstractMenu) entry);
            } else if (entry instanceof AbstractAction) {
                menubar.addItem(entry.getCaption(), (item) -> {
                    home.irA(app.getState(entry));
                });
            }
            //file.addSeparator();
        }

    }

    private void addMenu(App app, MenuBar menubar, IArea area) {
        final MenuBar.MenuItem menu = menubar.addItem(area.getName(), null);
        for (IModule module : area.getModules()) {
            addMenu(app, menu, module);
        }
    }

    private void addMenu(App app, MenuBar.MenuItem menu, IModule module) {
        for (MenuEntry entry : module.getMenu()) {
            if (entry instanceof AbstractMenu) {
                MenuBar.MenuItem submenu = menu.addItem(entry.getCaption(), null);
                addSubmenu(app, submenu, (AbstractMenu) entry);
            } else if (entry instanceof AbstractAction) {
                menu.addItem(entry.getCaption(), (item) -> {
                    home.irA(app.getState(entry));
                });
            }
            //file.addSeparator();

        }
    }

    private void addSubmenu(App app, MenuBar.MenuItem menu, AbstractMenu entries) {
        for (MenuEntry entry : entries.getEntries()) {
            if (entry instanceof AbstractMenu) {
                MenuBar.MenuItem submenu = menu.addItem(entry.getCaption(), null);
                addSubmenu(app, submenu, (AbstractMenu) entry);
            } else if (entry instanceof AbstractAction) {
                menu.addItem(entry.getCaption(), (item) -> {
                    home.irA(app.getState(entry));
                });
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

    public void updateSession() {
        menuSearcher.updateDataProvider((AbstractApplication) MDDUIAccessor.getApp());
    }
}
