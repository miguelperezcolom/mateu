package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.AbstractMDDExecutionContext;

import java.util.HashMap;
import java.util.Map;

public class NavigationComponent extends VerticalLayout {

    private final AbstractApplication app;
    private AbstractArea area;
    private Map<MenuEntry, Button> botones;
    private MenuEntry menu;

    public NavigationComponent(AbstractApplication app) {

        this.app = app;

        addStyleName("navegacion");
        setSpacing(false);


        build();

    }

    private void build() {
        botones = new HashMap<>();
        menu = null;
        for (AbstractArea a : app.getAreas()) {

            boolean valid = false;

            if (area != null) {
                valid = a.equals(area);
            } else {
                if (MDD.getUserData() == null) valid = a.isPublicAccess();
                else valid = !a.isPublicAccess();
            }

            if (valid) {

                Button b = new Button(a.getName(), a.getIcon());
                //b.setIcon(FontAwesome.TH_LIST);
                b.setPrimaryStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName("tituloarea");
                b.setDescription("Click to change to another area");
                addComponent(b);

                b.addClickListener(e -> MyUI.get().getNavegador().goTo((a.isPublicAccess())?"public":"private"));

                for (AbstractModule m : a.getModules()) {

                    Label l;
                    addComponent(l = new Label(m.getName()));
                    l.addStyleName("titulomodulo");

                    for (MenuEntry e : m.getMenu()) {

                        addMenu(e);

                    }

                }

                break;

            }

        }
    }

    private void addMenu(MenuEntry e) {


        Button b = new Button(e.getName() + ((e instanceof  AbstractMenu)?"<span class=\"menu-badge\">" + ((AbstractMenu) e).getEntries().size() + "</span>":""));
        //b.setIcon(FontAwesome.TH_LIST);
        b.setPrimaryStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("opcionmenu");
        //b.addStyleName("selected");
        b.setCaptionAsHtml(true);
        addComponent(b);

        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                MyUI.get().getNavegador().goTo(e);

            }
        });


        botones.put(e, b);

    }

    public void setArea(AbstractArea a) {
        this.area = a;
        removeAllComponents();
        build();
    }

    public void setMenu(MenuEntry menu) {
        if (this.menu != null) botones.get(this.menu).removeStyleName("selected");
        if (menu != null) botones.get(menu).addStyleName("selected");
        this.menu = menu;
    }
}
