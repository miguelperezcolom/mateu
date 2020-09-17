package io.mateu.mdd.vaadinport.vaadin.components.app.desktop;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class SessionComponent extends VerticalLayout {

    //private final Image foto;
    private final Button signingButton;
    private final Button greeting;

    public SessionComponent(DesktopAppComponent appComponent) {

        addStyleName("sesion");

        setSpacing(false);

        /*
        addComponent(foto = new Image("", new ClassResource("/images/profile.jpg")));
        foto.setVisible(false);
        foto.addStyleName("foto");
        //foto.setDescription("Click to change your profile");
        foto.addClickListener(e -> MDDUI.get().getNavegador().goTo("private/profile"));
        */

        addComponent(greeting = new Button("Hi"));
        greeting.addStyleName("greeting");
        greeting.setIcon(VaadinIcons.USER);
        greeting.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
        greeting.addStyleName("signingbutton");
        greeting.addClickListener(e -> {
            MDDUI.get().getNavegador().doAfterCheckSaved(() -> {
                appComponent.unselectAll();
                greeting.addStyleName("selected");
                MDDUI.get().getNavegador().goTo("private/profile");
            });
        });

        addComponent(signingButton = new Button("Login"));
        signingButton.setIcon(VaadinIcons.SIGN_IN);
        signingButton.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
        signingButton.addStyleName("signingbutton");
        signingButton.addClickListener(e -> {
            MDDUI.get().getNavegador().doAfterCheckSaved(() -> {
                appComponent.unselectAll();
                signingButton.addStyleName("selected");
                if (MDD.getCurrentUserLogin() != null) {
                    MDDUI.get().getNavegador().goTo("bye");
                } else {
                    MDDUI.get().getNavegador().goTo("login");
                }
            });
        });

        if (MDD.getCurrentUserLogin() != null) signingButton.setVisible(true);
        if (!MDD.getApp().isAuthenticationNeeded() && !MDD.getApp().hasPrivateContent()) signingButton.setVisible(false);
        else signingButton.setVisible(true);

    }

    public void update() {
        if (MDD.getCurrentUserLogin() != null) {
            greeting.setVisible(true);
            greeting.setCaption("Hi " + MDD.getCurrentUser().getName());
            //foto.setCaption("Hi " + MDD.getUserData().getName());
            signingButton.setVisible(true);
            signingButton.setIcon(VaadinIcons.SIGN_OUT);
            signingButton.setCaption("Logout");
        } else {
            greeting.setVisible(false);
            if (!MDD.getApp().isAuthenticationNeeded() && !MDD.getApp().hasPrivateContent()) signingButton.setVisible(false);
            else signingButton.setVisible(true);
            signingButton.setIcon(VaadinIcons.SIGN_IN);
            signingButton.setCaption("Login");
        }
    }

    public void setSigningIn() {
        signingButton.addStyleName("selected");
    }

    public void unselectAll() {
        greeting.removeStyleName("selected");
        signingButton.removeStyleName("selected");
    }
}
