package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.server.ExternalResource;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.navigation.ViewStack;

public class PublicMenuFlowComponent extends AbstractViewComponent {

    @Override
    public boolean isBarHidden() {
        return true;
    }

    @Override
    public String toString() {
        return MDD.isMobile() || MDD.getApp().getAreas().size() <= 1?"":"Please select work area";
    }


    public PublicMenuFlowComponent() {
        addStyleName("publicmenuflowcomponent");
        addStyleName(CSS.NOPADDING);
        if (MDD.isMobile()) {

            addComponent(new Label(MDD.getApp().getName()));

            try {
                Helper.notransact(em -> {
                    AppConfig c = AppConfig.get(em);
                    if (c.getLogo() != null) {
                        Image img;
                        addComponent(img = new Image(null, new ExternalResource(c.getLogo().toFileLocator().getUrl())));
                        img.setWidth("200px");
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

                MDDUI.get().getAppComponent().setSelectingArea();

                MDD.getApp().getAreas().stream().forEach(a -> {

                    Button b;
                    lx.addComponent(b = new Button(a.getName(), a.getIcon()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.setPrimaryStyleName(ValoTheme.BUTTON_HUGE);
                    b.addStyleName("submenuoption");


                });
            }


        if (MDD.isMobile() && (MDD.getApp().isAuthenticationNeeded() || MDD.getApp().hasPrivateContent())) {
            Button b;
            addComponent(b = new Button("Login"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("login"));
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("submenuoption");
        }


       if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));
    }

}
