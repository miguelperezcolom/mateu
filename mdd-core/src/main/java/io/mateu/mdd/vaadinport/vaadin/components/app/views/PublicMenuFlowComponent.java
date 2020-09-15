package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Button;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.Image;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.shared.IAppConfig;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.views.AbstractViewComponent;

public class PublicMenuFlowComponent extends AbstractViewComponent {

    @Override
    public boolean isBarHidden() {
        return true;
    }

    @Override
    public String toString() {
        return MDD.isMobile() || MDD.getApp().getAreas().size() <= 1?"":"Please select work area";
    }

    @Override
    public String getPageTitle() {
        return MDD.getApp().getName();
    }

    public PublicMenuFlowComponent() {
        addStyleName("publicmenuflowcomponent");
        addStyleName(CSS.NOPADDING);
        if (MDD.isMobile()) {

            Label l;
            addComponent(l = new Label(MDD.getApp().getName()));
            l.addStyleName(ValoTheme.LABEL_H1);

            try {
                IAppConfig c = Helper.getImpl(AppConfigLocator.class).get();
                if (c.getLogoUrl() != null) {
                    Image img;
                    addComponent(img = new Image(null, new ExternalResource(c.getLogoUrl())));
                    img.setWidth("200px");
                }
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }

            if (MDD.getApp().getAreas().size() == 1) {

                AbstractArea area = MDD.getApp().getAreas().get(0);

                if (area.getModules().size() == 1) {

                    AbstractModule m = area.getModules().get(0);

                    m.getMenu().stream().forEach(a -> {

                        Button b;
                        addComponent(b = new Button(a.getCaption()));
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

                MDDUI.get().getAppComponent().setSelectingArea(true);

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

       if (!MDD.isMobile() && MDD.getApp().getAreas().size() > 1) MDDUI.get().getAppComponent().setSelectingArea(true);
    }

}
