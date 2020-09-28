package io.mateu.mdd.vaadin.components.app.views;

import com.google.common.base.Strings;
import com.vaadin.event.ShortcutAction;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.oauth.GitHubButton;
import io.mateu.mdd.vaadin.components.oauth.GoogleButton;
import io.mateu.mdd.vaadin.components.oauth.MicrosoftButton;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.util.notification.Notifier;

import java.util.ArrayList;
import java.util.List;

public class LoginFlowComponent extends AbstractViewComponent {

    private TextField login;
    private PasswordField password;

    @Override
    public String toString() {
        return "Login";
    }


    public LoginFlowComponent() {

        addStyleName("logincomponent");

        setSizeFull();

        List<Layout> layouts = new ArrayList<>();

        if (!"true".equalsIgnoreCase(System.getProperty("oauthonly"))) {
            VerticalLayout izda = new VerticalLayout();

            izda.addStyleName("loginilayoutizda");
            izda.setSizeUndefined();

            Label t;
            izda.addComponent(t = new Label("Sign in " + MDDUI.get().getApp().getName() + ":"));
            t.addStyleName(ValoTheme.LABEL_H3);

            izda.addComponent(login = new TextField("Login"));
            izda.addComponent(password = new PasswordField("password"));

            HorizontalLayout hl;
            izda.addComponent(hl = new HorizontalLayout());
            Button b;
            hl.addComponent(b = new Button("Sign in", e -> login()));
            //b.setDescription("Click ENTER to sign in");
            b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
            b.addStyleName(ValoTheme.BUTTON_PRIMARY);

            hl.addComponent(b = new Button("Forgot password", e -> forgotPassword()));




            if (System.getProperty("oauth.github.client_id") != null
                    || System.getProperty("oauth.google.client_id") != null
                    || System.getProperty("oauth.microsoft.client_id") != null) {


                if (System.getProperty("oauth.github.client_id") != null) izda.addComponent(new GitHubButton(System.getProperty("oauth.github.client_id"), System.getProperty("oauth.github.client_secret")));

                if (System.getProperty("oauth.google.client_id") != null) izda.addComponent(new GoogleButton(System.getProperty("oauth.google.client_id"), System.getProperty("oauth.google.client_secret")));

                if (System.getProperty("oauth.microsoft.client_id") != null) izda.addComponent(new MicrosoftButton(System.getProperty("oauth.microsoft.client_id"), System.getProperty("oauth.microsoft.client_secret")));

            }




            izda.addComponentsAndExpand(new Label(""));

            layouts.add(izda);

        }



        if (MDDUI.get().getPort().isMobile()) {

            VerticalLayout l;
            layouts.add(l = new VerticalLayout());

            Button b;
            l.addComponent(b = new Button("Go back to menu"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("public"));
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("submenuoption");

        }

        if (layouts.size() > 1) {

            CssLayout cl = new CssLayout();
            layouts.forEach(l -> cl.addComponent(l));
            addComponentsAndExpand(cl);

        } else if (layouts.size() > 0) {

            addComponentsAndExpand(layouts.get(0));

        }



        if (login != null) login.focus();

    }

    private void forgotPassword() {

        if (!Strings.isNullOrEmpty(login.getValue())) {

            try {
                //Notifier.info(((BaseMDDApp)MDDUI.get().getApp()).recoverPassword(login.getValue()));
            } catch (Throwable throwable) {
                Notifier.alert(throwable);
            }


        } else {

             Notifier.alert("Login is required");
            login.focus();

        }


    }

    private void login() {

        if (Strings.isNullOrEmpty(login.getValue())) {
             Notifier.alert("Login is required");
            login.focus();
        } else if (Strings.isNullOrEmpty(password.getValue())) {
             Notifier.alert("Password is required");
            password.focus();
        } else {

            try {
                //((BaseMDDApp)MDDUI.get().getApp()).authenticate(login.getValue(), password.getValue());
                MDDUI.get().getAppComponent().unselectAll();
                MDDUI.get().getNavegador().goTo("welcome");
            } catch (Throwable throwable) {
                 Notifier.alert(throwable);
            }

        }

    }

}
