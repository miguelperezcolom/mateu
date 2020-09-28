package io.mateu.mdd.vaadin.components.app.views;

import com.google.common.base.Strings;
import com.vaadin.event.ShortcutAction;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.Page;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.shared.IAppConfig;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.oauth.GitHubButton;
import io.mateu.mdd.vaadin.components.oauth.GoogleButton;
import io.mateu.mdd.vaadin.components.oauth.MicrosoftButton;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

public class LoginComponent extends VerticalLayout {

    private Runnable onLogin;
    private TextField login;
    private PasswordField password;

    @Override
    public String toString() {
        return "Login";
    }


    public LoginComponent(Runnable onLogin) {
        this.onLogin = onLogin;


        Page.getCurrent().setTitle("Login");


        addStyleName("logincomponent2");

        setSizeFull();

        VerticalLayout info = new VerticalLayout();
        info.addStyleName("info");
        info.setWidthUndefined();

        VerticalLayout vl;
        info.addComponent(vl = new VerticalLayout());
        vl.addStyleName(CSS.ALIGNCENTER);

        try {
            VerticalLayout finalVl = vl;
            IAppConfig c = Helper.getImpl(AppConfigLocator.class).get();
            if (c != null && c.getLogoUrl() != null) vl.addComponent(new Image(null, new ExternalResource(c.getLogoUrl())));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        Label l;
        vl.addComponent(l = new Label(System.getProperty("welcome.message", "Welcome to " + MDDUI.get().getApp().getName() + ".")));
        l.addStyleName(ValoTheme.LABEL_H1);
        vl.addComponent(l = new Label(System.getProperty("welcome.info", "Here your welcome info")));
        //l.addStyleName(ValoTheme.LABEL_H1);


        VerticalLayout form = new VerticalLayout();
        form.addStyleName("form");
        form.setWidthUndefined();
        form.addComponent(vl = new VerticalLayout());
        vl.setWidth("80%");

        Label t;
        vl.addComponent(t = new Label("Sign in " + MDDUI.get().getApp().getName() + ":"));
        t.addStyleName(ValoTheme.LABEL_H3);
        t.addStyleName("signinlabel");

        vl.addComponent(login = new TextField("Login"));
        vl.addComponent(password = new PasswordField("Password"));
        login.setWidth("100%");
        password.setWidth("100%");

        //vl.addComponent(new Label(" "));

        Button b;
        vl.addComponent(b = new Button("Sign in", e -> login()));
        //b.setDescription("Click ENTER to sign in");
        b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        b.addStyleName(ValoTheme.BUTTON_PRIMARY);
        b.addStyleName("botonsignin");
        vl.addComponent(b = new Button("Forgot password", e -> forgotPassword()));
        b.addStyleName("botonforgotpassword");


        if (System.getProperty("oauth.github.client_id") != null
                || System.getProperty("oauth.google.client_id") != null
                || System.getProperty("oauth.microsoft.client_id") != null) {


            if (System.getProperty("oauth.github.client_id") != null) vl.addComponent(new GitHubButton(System.getProperty("oauth.github.client_id"), System.getProperty("oauth.github.client_secret")));

            if (System.getProperty("oauth.google.client_id") != null) vl.addComponent(new GoogleButton(System.getProperty("oauth.google.client_id"), System.getProperty("oauth.google.client_secret")));

            if (System.getProperty("oauth.microsoft.client_id") != null) vl.addComponent(new MicrosoftButton(System.getProperty("oauth.microsoft.client_id"), System.getProperty("oauth.microsoft.client_secret")));

        }


        CssLayout cl = new CssLayout();
        cl.addStyleName("cajalogin");
        cl.addStyleName(CSS.ALIGNCENTER);
        cl.setSizeUndefined();
        //layouts.forEach(l -> cl.addComponent(l));
        cl.addComponent(info);
        cl.addComponent(form);
        addComponent(cl);


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
               // ((BaseMDDApp)MDDUI.get().getApp()).authenticate(login.getValue(), password.getValue());
                if (onLogin != null) onLogin.run();
                MDDUI.get().getAppComponent().unselectAll();
                String ps = MDDUI.get().getNavegador().getViewProvider().getPendingPrivateState();
                MDDUI.get().getNavegador().goTo(!Strings.isNullOrEmpty(ps)?ps:"welcome");
            } catch (Throwable throwable) {
                Notifier.alert(throwable);
            }

        }

    }

}
