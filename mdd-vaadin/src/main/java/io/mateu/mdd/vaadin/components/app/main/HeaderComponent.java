package io.mateu.mdd.vaadin.components.app.main;

import com.google.common.base.Strings;
import com.vaadin.server.*;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class HeaderComponent extends HorizontalLayout {

    private final MainComponent home;

    public HeaderComponent(MainComponent home) {
        this.home = home;
        setWidthFull();
        addStyleName("mateu-header");

        refresh(false);

    }

    public void refresh(boolean isPrivate) {
        removeAllComponents();

        App app = MDDUIAccessor.getApp();

        String logo = app.getLogo();
        Image i;
        Resource resource = new ThemeResource("img/logomateu2.png");
        if (!Strings.isNullOrEmpty(logo)) {
            if (logo.startsWith("http")) {
                resource = new ExternalResource(logo);
            } else {
                resource = new ClassResource(logo);
            }
        }
        addComponent(i = new Image(null, resource));
        i.setHeight("37px");
        i.addClickListener(e -> MDDUIAccessor.goTo(""));
        i.addStyleName("clickable");
        Label l;
        HorizontalLayout hl;
        addComponent(hl = new HorizontalLayout(l = new Label(app.getName())));
        l.addStyleName("appname");
        l.addStyleName("clickable");
        hl.addStyleName(CSS.NOPADDING);
        hl.addLayoutClickListener(e -> MDDUIAccessor.goTo(""));

        MenuBar bar;
        addComponent(bar = getMenuBar(app, isPrivate));

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

        setExpandRatio(bar, 1);
    }


    MenuBar getMenuBar(App app, boolean isPrivate) {
        MenuBar.Command click = new MenuBar.Command() {
            @Override
            public void menuSelected(MenuBar.MenuItem selectedItem) {
                Notification.show("Clicked " + selectedItem.getText());
                home.irA("home");
            }
        };

        MenuBar menubar = new MenuBar();
        menubar.addStyleName(ValoTheme.MENUBAR_BORDERLESS);
        //menubar.setWidth("100%");




        List<IArea> areas = Arrays.asList(app.getAreas()).stream().filter(a -> (!isPrivate && a.isPublicAccess()) || (isPrivate && !a.isPublicAccess())).collect(Collectors.toList());
        if (areas.size() == 1) {
            IArea area = areas.get(0);
            for (IModule module : area.getModules()) {
                addMenu(app, menubar, module);
            }
        } else {
            areas.forEach(area -> addMenu(app, menubar, area));
        }

        return menubar;
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


}
