package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class PublicMenuFlowComponent extends VerticalLayout {

    @Override
    public String toString() {
        return "Change work area";
    }


    public PublicMenuFlowComponent() {

        addStyleName("publicmenuflowcomponent");
        addStyleName(CSS.NOPADDING);


        if (MDD.getApp().getAreas().size() == 1) {

            AbstractArea area = MDD.getApp().getAreas().get(0);

            if (area.getModules().size() == 1) {

                AbstractModule m = area.getModules().get(0);

                m.getMenu().stream().forEach(a -> {

                    Button b;
                    addComponent(b = new Button(a.getName()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                    b.addStyleName("areabutton");

                });


            } else {

                area.getModules().stream().forEach(a -> {

                    Button b;
                    addComponent(b = new Button(a.getName()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                    b.addStyleName("areabutton");

                });

            }

        } else MDD.getApp().getAreas().stream().forEach(a -> {

            Button b;
            addComponent(b = new Button(a.getName(), a.getIcon()));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addStyleName("areabutton");


        });

        if (MDD.isMobile() && (MDD.getApp().isAuthenticationNeeded() || MDD.getApp().hasPrivateContent())) {
            Button b;
            addComponent(b = new Button("Login"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("login"));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addStyleName("areabutton");
        }


       if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));
    }

}
