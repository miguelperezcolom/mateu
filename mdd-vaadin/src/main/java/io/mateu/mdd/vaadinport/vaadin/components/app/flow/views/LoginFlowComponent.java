package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.event.ShortcutAction;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.GitHubButton;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.GoogleButton;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.MicrosoftButton;

public class LoginFlowComponent extends VerticalLayout {

    private final TextField login;
    private final PasswordField password;

    @Override
    public String toString() {
        return "Login";
    }


    public LoginFlowComponent() {

        addStyleName("logincomponent");

        setSizeFull();


        VerticalLayout izda = new VerticalLayout();

        izda.addStyleName("loginilayoutizda");
        izda.setSizeUndefined();

        Label t;
        //izda.addComponent(t = new Label("Sign in " + MDD.getApp().getName()));
        //t.addStyleName(ValoTheme.LABEL_H3);

        izda.addComponent(login = new TextField("Login"));
        izda.addComponent(password = new PasswordField("password"));

        HorizontalLayout hl;
        izda.addComponent(hl = new HorizontalLayout());
        Button b;
        hl.addComponent(b = new Button("Sign in", e -> login()));
        b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        b.addStyleName(ValoTheme.BUTTON_PRIMARY);

        hl.addComponent(b = new Button("Forgot password", e -> forgotPassword()));


        VerticalLayout dcha = new VerticalLayout();
        dcha.addStyleName("loginilayoutdcha");
        dcha.setSizeUndefined();


        dcha.addComponent(t = new Label("Or:"));
        t.addStyleName(ValoTheme.LABEL_H3);

        dcha.addComponent(new GitHubButton("2043fd5fdff6f9986731", "mysecret"));

        dcha.addComponent(new GoogleButton("1058149524857-gq2tebj8v2c21k51psiv87eu4gtbhs5p.apps.googleusercontent.com", "-EHzj7LyMGQq_rD5fUAkJI8H"));

        dcha.addComponent(new MicrosoftButton("1058149524857-gq2tebj8v2c21k51psiv87eu4gtbhs5p.apps.googleusercontent.com", "-EHzj7LyMGQq_rD5fUAkJI8H"));

        dcha.addComponent(new Label(""));

/*
        ob.addOAuthListener(new OAuthListener() {

            @Override
            public void authSuccessful(Token token, boolean isOAuth20) {
                // Do something useful with the OAuth token, like persist it
                if (token instanceof OAuth2AccessToken) {
                    ((OAuth2AccessToken) token).getAccessToken();
                    ((OAuth2AccessToken) token).getRefreshToken();
                    ((OAuth2AccessToken) token).getExpiresIn();
                } else {
                    ((OAuth1AccessToken) token).getToken();
                    ((OAuth1AccessToken) token).getTokenSecret();
                }
            }

            @Override
            public void authDenied(String reason) {
                Notification.show("Failed to authenticate!", Notification.Type.ERROR_MESSAGE);
            }
        });
*/


        /*

        dcha.addComponent(new OAuthPopupButton(com.github.scribejava.apis.LiveApi.instance(), "mikey", "misecret"));
        OAuthPopupConfig config = OAuthPopupConfig.getStandardOAuth20Config("my-key", "my-secret");
        //config.setGrantType("authorization_code");
        config.setScope("https://www.googleapis.com/auth/plus.login");
        config.setCallbackUrl("urn:ietf:wg:oauth:2.0:oob");
        OAuthPopupButton google = new OAuthPopupButton(GoogleApi20.instance(), config);

*/

        CssLayout cl = new CssLayout(izda, dcha);
        addComponentsAndExpand(cl);

    }

    private void forgotPassword() {
    }

    private void login() {

        try {
            UserData u = ((BaseMDDApp)MDD.getApp()).authenticate(login.getValue(), password.getValue());
            MDD.setUserData(u);
            MyUI.get().getNavegador().goTo("welcome");
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }

    }

}
