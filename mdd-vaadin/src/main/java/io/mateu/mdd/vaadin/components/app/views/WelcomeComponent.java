package io.mateu.mdd.vaadin.components.app.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Button;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.Image;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.shared.IAppConfig;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.util.Helper;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;

public class WelcomeComponent extends AbstractViewComponent {

    /*
    @Override
    public String toString() {
        return "Hello " + MDD.getUserData().getName();
    }

    public WelcomeComponent() {

        addStyleName("welcomeflowcomponent");

        addComponent(new Label("It's nice to see you."));
        addComponent(new Label("Let's have some fun ;)"));


        if (MDDUIAccessor.isMobile()) {

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
        return "Hello " + MDDUIAccessor.getCurrentUser().getName() + "." + (MDDUIAccessor.getApp().getAreas().length > 1?" Please select work area":"");
    }

    public WelcomeComponent() {
        addStyleName("privatemenuflowcomponent");

        addStyleName(CSS.NOPADDING);
        if (MDDUIAccessor.isMobile()) {
            addStyleName("mobile");

            try {
                IAppConfig c = Helper.getImpl(AppConfigLocator.class).get();
                if (c.getLogoUrl() != null) {
                    addComponent(new Image(null, new ExternalResource(c.getLogoUrl())));
                }
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }

        if (MDDUIAccessor.getApp().getAreas().length == 1) {

            AbstractArea area = (AbstractArea) MDDUIAccessor.getApp().getAreas()[0];

            if (area.getModules().length == 1) {

                AbstractModule m = (AbstractModule) area.getModules()[0];

                m.getMenu().stream().forEach(a -> {

                    Button b;
                    addComponent(b = new Button(a.getCaption()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.addStyleName("submenuoption");


                });


            } else {

                for (IModule a : area.getModules()) {
                    Button b;
                    addComponent(b = new Button(a.getName()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.addStyleName("submenuoption");
                };

            }
        }

        } else if (MDDUIAccessor.getApp().getAreas().length > 1) {

            CssLayout lx;
            addComponent(lx = new CssLayout());

            for (IArea a : MDDUIAccessor.getApp().getAreas()) {
                Button b;
                lx.addComponent(b = new Button(a.getName(), VaadinIcons.ADOBE_FLASH.equals(a.getIcon())?null:a.getIcon()));
                b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                b.setPrimaryStyleName(ValoTheme.BUTTON_HUGE);
                b.addStyleName("submenuoption");
            };
        }

        if (MDDUIAccessor.isMobile()) {
            Button b;
            addComponent(b = new Button("Logout"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("bye"));
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("submenuoption");
        }

        addComponentsAndExpand(new Label(""));

    }

}
