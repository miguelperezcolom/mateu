package io.mateu.mdd.vaadin.components.app.desktop;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.core.app.Searcher;

import java.util.HashMap;
import java.util.Map;

public class NavigationComponent extends VerticalLayout {

    private static final String[] estilosAreas = {"area-1", "area-2", "area-3", "area-4", "area-5", "area-6", "area-7", "area-8", "area-9", "area-10"};


    private AbstractApplication app;
    private AbstractArea area;
    private Map<MenuEntry, Component> botones;
    private MenuEntry menu;
    private Button bArea;
    private Button bBuscar;
    private Button bLogout;

    public NavigationComponent(AbstractApplication app) {

        this.app = app;

        addStyleName("navegacion");
        setSpacing(false);


        build();

    }

    private void build() {
        botones = new HashMap<>();
        menu = null;

        if (area != null) {

            for (IArea a : app.getAreas()) {

                boolean valid = false;

                if (area != null) {
                    valid = a.equals(area);
                } else {
                    if (MDDUIAccessor.getCurrentUser() == null) valid = a.isPublicAccess();
                    else valid = !a.isPublicAccess();
                }

                if (valid) {

                    if (app.getAreas().length > 1) {

                        Button b = bArea = new Button(a.getName().toUpperCase() + ((app.getAreas().length > 1)?"<span class=\"menu-badge\">" + "<i class=\"fas fa-compass\"></i>" + "</span>":"")
                                , ev -> {
                            clicked();
                            MDDUI.get().getNavegador().doAfterCheckSaved(() -> {
                                if (MDDUIAccessor.isMobile()) {
                                    setSelectingArea(false);
                                    MDDUI.get().getNavegador().goTo(((a.isPublicAccess())?"public":"private"), ev.isCtrlKey());
                                } else {
                                    MDDUI.get().chooseArea(MDDUIAccessor.getCurrentUser() == null);
                                }
                            });

                        }); //, a.getIcon());
                        if (!VaadinIcons.ADOBE_FLASH.equals(a.getIcon())) b.setIcon(a.getIcon());
                        b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                        b.setCaptionAsHtml(true);
                        b.addStyleName("tituloarea");
                        //b.setDescription("Click to change to another area");

                        /*
                        String estiloArea = a.getStyle();
                        if (Strings.isNullOrEmpty(estiloArea)) estiloArea = estilosAreas[app.getAreas().indexOf(a) + 1 % estilosAreas.length];
                        b.addStyleName(estiloArea);

                         */

                        addComponent(b);

                        //b.addClickListener(e -> MDDUI.get().getNavegador().goTo((a.isPublicAccess())?"public":"private"));

                    }


                    for (IModule m : a.getModules()) {

                        Label l;
                        addComponent(l = new Label(m.getName()));
                        l.addStyleName("titulomodulo");

                        for (MenuEntry e : m.getMenu()) {

                            addMenu(e);

                        }

                    }


                    VerticalLayout l;
                    addComponent(l = new VerticalLayout());
                    l.addStyleName(CSS.NOPADDING);
                    l.addStyleName("espaciobotonbuscar");

                    Button b = bBuscar = new Button("Search"
                            , ev -> {
                        clicked();
                        MDDUI.get().getNavegador().doAfterCheckSaved(() -> {
                            if (MDDUIAccessor.isMobile()) {
                                setSearching();
                                MDDUI.get().getNavegador().goTo("search", ev.isCtrlKey());
                            } else {
                                MDDUI.get().search();
                            }
                        });

                    }); //, a.getIcon());
                    b.setIcon(VaadinIcons.SEARCH);
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.setCaptionAsHtml(true);
                    b.addStyleName("botonbuscar");
                    //b.setDescription("Click to change to another area");
                    bBuscar.setVisible(canBeSearched(app));

                    addComponent(b);


                    b = bLogout = new Button("Log out"
                            , ev -> {
                        clicked();
                        MDDUI.get().getNavegador().doAfterCheckSaved(() -> {
                            MDDUI.get().getNavegador().goTo("bye");
                        });

                    }); //, a.getIcon());
                    b.setIcon(VaadinIcons.SIGN_OUT);
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.setCaptionAsHtml(true);
                    b.addStyleName("botonlogout");
                    //b.setDescription("Click to change to another area");

                    addComponent(b);

                    break;

                }

            }

        } else {

            if (app.getAreas().length > 1) {
                Button b = bArea = new Button("CHOOSE AN AREA" + ((app.getAreas().length > 1)?"<span class=\"menu-badge\">" + VaadinIcons.ARROW_RIGHT.getHtml() + "</span>":"")
                        , ev -> {
                    clicked();
                    if (MDDUIAccessor.isMobile()) {
                        MDDUI.get().getAppComponent().unselectAll();
                        bArea.addStyleName("selected");
                        MDDUI.get().getNavegador().goTo(MDDUIAccessor.getCurrentUser() == null?"public":"private", ev.isCtrlKey());
                    } else {
                        MDDUI.get().chooseArea(MDDUIAccessor.getCurrentUser() == null);
                    }
                });
                b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                b.addStyleName("selected");
                b.setCaptionAsHtml(true);
                b.addStyleName("tituloarea");

                /*
                String estiloArea = estilosAreas[0];
                b.addStyleName(estiloArea);
                 */

                addComponent(b);
            }

        }

    }

    private void addMenu(MenuEntry e) {


        Button b = new Button(e.getCaption() + ((e instanceof AbstractMenu)?"<span class=\"menu-badge\">" + VaadinIcons.ELLIPSIS_DOTS_H.getHtml() + "</span>":"")
        , ev -> {
            clicked();
            MDDUI.get().getNavegador().doAfterCheckSaved(() -> {
                MDDUI.get().getNavegador().goTo(e, ev.isCtrlKey());
            });

        });
        //b.setIcon(FontAwesome.TH_LIST);
        if (e.getIcon() != null) b.setIcon(e.getIcon());
        b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
        b.addStyleName("opcionmenu");
        //b.addStyleName("selected");
        b.setCaptionAsHtml(true);
        addComponent(b);

        /*
        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                MDDUI.get().getNavegador().goTo(e);

            }
        });
        */


        botones.put(e, b);

    }

    public void setApp(AbstractApplication app) {
        this.app = app;
        setArea(null);
    }

    private boolean canBeSearched(AbstractApplication app) {
        return app != null && app.getSearcher() != null && !Searcher.class.equals(app.getSearcher().getClass()) || app.getAreas().length > 1  || (app.getAreas().length > 0 && app.getAreas()[0].getModules().length > 0 && app.getAreas()[0].getModules()[0].getMenu().size() > 0);
    }

    public void setArea(AbstractArea a) {
        this.area = a;
        removeAllComponents();
        build();
    }

    public void setMenu(MenuEntry menu) {
        if (bBuscar != null) {
            bBuscar.removeStyleName("selected");
            bBuscar.setVisible(canBeSearched(app));
        }
        if (this.menu != null) {
            if (bArea!= null) bArea.removeStyleName("selected");
            botones.get(this.menu).removeStyleName("selected");
        }
        if (menu != null) botones.get(menu).addStyleName("selected");
        this.menu = menu;
    }

    public void unselectAll() {
        if (bArea != null && area != null) bArea.setCaption(area.getName().toUpperCase() + ((app.getAreas().length > 1)?"<span class=\"menu-badge\">" + "<i class=\"fas fa-compass\"></i>" + "</span>":""));
        if (bArea != null) bArea.removeStyleName("selected");
        setMenu(null);
    }

    public void setSearching() {
        unselectAll();
        if (bBuscar != null) bBuscar.addStyleName("selected");
    }

    public void setSelectingArea(boolean force) {
        if (force) {
            MDDUI.get().getAppComponent().unselectAll();
            if (bArea != null) {
                bArea.addStyleName("selected");
                bArea.setIcon(null);
                bArea.setCaption("CHOOSE AN AREA <span class=\"menu-badge\">" + VaadinIcons.ARROW_RIGHT.getHtml() + "</span>");
            }
        }
    }

    public void clicked() {
        if (getStyleName().contains("xxvisible")) removeStyleName("xxvisible");
    }
}
