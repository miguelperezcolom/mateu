package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

public class MobileMenuComponent extends VerticalLayout {

    private final MenuEntry area;

    @Override
    public String toString() {
        return "Welcome to " + area.getName() + " menu.";
    }

    public MobileMenuComponent(MenuEntry area) {

        this.area = area;

        addStyleName("methodresultflowcomponent");


        if (area instanceof AbstractMenu) {

            ((AbstractMenu) area).getEntries().stream().forEach(a -> {

                Button b;
                addComponent(b = new Button(a.getName()));
                b.addClickListener(e -> MyUI.get().getNavegador().goTo(a));
                b.addStyleName(ValoTheme.BUTTON_QUIET);

            });

        }



        if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));


    }

}
