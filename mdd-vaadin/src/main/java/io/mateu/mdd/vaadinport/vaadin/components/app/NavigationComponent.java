package io.mateu.mdd.vaadinport.vaadin.components.app;

import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.*;

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

        if (e instanceof AbstractMenu) {
            addComponent(new Label(e.getName()));
            for (MenuEntry s : ((AbstractMenu) e).getEntries()) {
                addMenu(s);
            }
        } else if (e instanceof AbstractAction) {
            Button b;
            addComponent(b = new Button(e.getName()));
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(new Button.ClickListener() {
                @Override
                public void buttonClick(Button.ClickEvent event) {
                    AbstractAction a = (AbstractAction) e;
                    a.setModifierPressed(event.isAltKey() || event.isCtrlKey());
                    a.run();
                }
            });
        }

    }

}
