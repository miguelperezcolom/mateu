package io.mateu.mdd.vaadinport.vaadin.components.app;

import com.vaadin.server.FontAwesome;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

public class NavigationComponent extends VerticalLayout {

    public NavigationComponent(AbstractApplication app) {

        for (AbstractArea a : app.getAreas()) {

            addComponent(new Label(a.getName()));


            for (AbstractModule m : a.getModules()) {

                addComponent(new Label(m.getName()));

                for (MenuEntry e : m.getMenu()) {

                    addMenu(e);

                }

            }

        }

    }

    private void addMenu(MenuEntry e) {


        Button b = new Button(e.getName() + ((e instanceof  AbstractMenu)?"<span class=\"valo-menu-badge\">" + ((AbstractMenu) e).getEntries().size() + "</span>":""));
        //b.setIcon(FontAwesome.TH_LIST);
        b.setPrimaryStyleName(ValoTheme.MENU_ITEM);
        b.addStyleName("selected");
        b.setCaptionAsHtml(true);
        addComponent(b);

        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                if (e instanceof AbstractMenu) {
                    ((MyUI)UI.getCurrent()).goTo(e);
                } else if (e instanceof AbstractAction) {
                    AbstractAction a = (AbstractAction) e;
                    a.setModifierPressed(event.isAltKey() || event.isCtrlKey());
                    a.run();
                }

            }
        });


    }

}
