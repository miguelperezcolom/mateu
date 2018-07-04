package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.AbstractMDDExecutionContext;

public class NavigationComponent extends VerticalLayout {

    public NavigationComponent(AbstractApplication app) {

        addStyleName("navegacion");
        setSpacing(false);


        for (AbstractArea a : app.getAreas()) {

            Label l;
            addComponent(l = new Label(a.getName()));
            l.addStyleName("tituloarea");


            for (AbstractModule m : a.getModules()) {

                addComponent(l = new Label(m.getName()));
                l.addStyleName("titulomodulo");

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
        b.addStyleName("opcionmenu");
        b.addStyleName("selected");
        b.setCaptionAsHtml(true);
        addComponent(b);

        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                if (e instanceof AbstractMenu) {
                    MyUI.get().getNavegador().goTo(e);
                } else if (e instanceof AbstractAction) {
                    AbstractAction a = (AbstractAction) e;
                    a.setModifierPressed(event.isAltKey() || event.isCtrlKey());
                    a.run(new AbstractMDDExecutionContext());
                }

            }
        });


    }

}
