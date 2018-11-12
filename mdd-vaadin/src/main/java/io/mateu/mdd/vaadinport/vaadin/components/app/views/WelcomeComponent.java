package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class WelcomeComponent extends VerticalLayout {

    @Override
    public String toString() {
        return "Hello " + MDD.getUserData().getName();
    }

    public WelcomeComponent() {

        addStyleName("methodresultflowcomponent");

        addComponent(new Label("It's nice to see you."));
        addComponent(new Label("Let's have some fun ;)"));


        if (MDD.isMobile()) {

            Button b;
            addComponent(b = new Button("Go to menu"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("private"));
            b.addStyleName(ValoTheme.BUTTON_QUIET);

        }

        addComponentsAndExpand(new Label(""));


    }

}
