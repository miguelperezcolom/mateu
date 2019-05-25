package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class AreaComponent extends VerticalLayout {

    private final AbstractArea area;

    @Override
    public String toString() {
        return "" + area.getName();
    }

    public AreaComponent(AbstractArea area) {

        this.area = area;

        addStyleName("areaflowcomponent");

        if (MDD.isMobile()) {

            if (area.getModules().size() == 1) {

                AbstractModule m = area.getModules().get(0);

                m.getMenu().stream().forEach(a -> {

                    Button b;
                    addComponent(b = new Button(a.getName()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.addStyleName("submenuoption");

                });


            } else {

                area.getModules().stream().forEach(a -> {

                    Button b;
                    addComponent(b = new Button(a.getName()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.addStyleName("submenuoption");

                });

            }

        } else {

            addComponentsAndExpand(new Label("You are now in the " + area.getName() + " area. Please look at the menu at the left side and choose an option."));

        }

        if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));
    }

}
