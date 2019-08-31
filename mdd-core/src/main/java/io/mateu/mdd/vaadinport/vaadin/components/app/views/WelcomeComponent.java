package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class WelcomeComponent extends VerticalLayout {

    /*
    @Override
    public String toString() {
        return "Hello " + MDD.getUserData().getName();
    }

    public WelcomeComponent() {

        addStyleName("welcomeflowcomponent");

        addComponent(new Label("It's nice to see you."));
        addComponent(new Label("Let's have some fun ;)"));


        if (MDD.isMobile()) {

            Button b;
            addComponent(b = new Button("Go to menu"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("private"));
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("submenuoption");

        } else {




        }

        addComponentsAndExpand(new Label(""));


    }
    */

    @Override
    public String toString() {
        return "Hello " + MDD.getUserData().getName() + "." + (MDD.getApp().getAreas().size() > 1?" Please select work area":"");
    }

    public WelcomeComponent() {

        addStyleName("privatemenuflowcomponent");

        addStyleName(CSS.NOPADDING);
        if (MDD.isMobile()) {
            addStyleName("mobile");

            try {
                Helper.notransact(em -> {
                    AppConfig c = AppConfig.get(em);
                    if (c.getLogo() != null) {
                        addComponent(new Image());
                    }
                });
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }

        if (MDD.getApp().getAreas().size() == 1) {

            AbstractArea area = MDD.getApp().getAreas().get(0);

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
        }

        } else if (MDD.getApp().getAreas().size() > 1) {

            CssLayout lx;
            addComponent(lx = new CssLayout());

            MDD.getApp().getAreas().stream().forEach(a -> {

                Button b;
                lx.addComponent(b = new Button(a.getName(), a.getIcon()));
                b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                b.setPrimaryStyleName(ValoTheme.BUTTON_HUGE);
                b.addStyleName("submenuoption");


            });
        }

        if (MDD.isMobile()) {
            Button b;
            addComponent(b = new Button("Logout"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("bye"));
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("submenuoption");
        }

        addComponentsAndExpand(new Label(""));

    }

}
