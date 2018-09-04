package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class PublicMenuFlowComponent extends VerticalLayout {

    @Override
    public String toString() {
        return "Public areas for " + MDD.getApp().getName();
    }


    public PublicMenuFlowComponent() {

        addStyleName("publicmenuflowcomponent");


        MDD.getApp().getAreas().stream().filter(a -> a.isPublicAccess()).forEach(a -> {

            Button b;
            addComponent(b = new Button(a.getName(), a.getIcon()));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
            b.addStyleName(ValoTheme.BUTTON_QUIET);


        });

        if (MDD.isMobile()) {
            Button b;
            addComponent(b = new Button("Login"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("login"));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
        }


       if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));
    }

}
