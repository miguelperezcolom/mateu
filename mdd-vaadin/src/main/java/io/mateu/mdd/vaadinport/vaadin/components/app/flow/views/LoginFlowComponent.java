package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.github.scribejava.core.model.OAuth1AccessToken;
import com.github.scribejava.core.model.OAuth2AccessToken;
import com.github.scribejava.core.model.Token;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.App;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import org.vaadin.addon.oauthpopup.OAuthListener;
import org.vaadin.addon.oauthpopup.OAuthPopupButton;
import org.vaadin.addon.oauthpopup.OAuthPopupConfig;
import org.vaadin.addon.oauthpopup.OAuthPopupUI;
import org.vaadin.addon.oauthpopup.buttons.*;

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

        Label t;
        izda.addComponent(t = new Label("Sign in " + MDD.getApp().getName()));
        t.addStyleName(ValoTheme.LABEL_H3);

        izda.addComponent(login = new TextField("Login"));
        izda.addComponent(password = new PasswordField("password"));
        izda.addComponent(new Button("Sign in", e -> login()));
        izda.addComponentsAndExpand(new Label(""));


        VerticalLayout dcha = new VerticalLayout();
        dcha.addStyleName("loginilayoutdcha");

        dcha.addComponent(t = new Label("Sign in with:"));
        t.addStyleName(ValoTheme.LABEL_H3);

        GitHubButton ob;
        dcha.addComponent(ob = new GitHubButton("mykey", "mysecret"));
        dcha.addComponent(new FacebookButton("mykey", "mysecret"));
        dcha.addComponent(new GoogleButton("mykey", "mysecret", "scope"));
        dcha.addComponent(new LinkedInButton("mykey", "mysecret"));
        dcha.addComponent(new TwitterButton("mykey", "mysecret"));


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


        dcha.addComponentsAndExpand(new Label(""));


        /*

        dcha.addComponent(new OAuthPopupButton(com.github.scribejava.apis.LiveApi.instance(), "mikey", "misecret"));
        OAuthPopupConfig config = OAuthPopupConfig.getStandardOAuth20Config("my-key", "my-secret");
        //config.setGrantType("authorization_code");
        config.setScope("https://www.googleapis.com/auth/plus.login");
        config.setCallbackUrl("urn:ietf:wg:oauth:2.0:oob");
        OAuthPopupButton google = new OAuthPopupButton(GoogleApi20.instance(), config);

*/

        HorizontalLayout hl = new HorizontalLayout(izda, dcha);

        addComponent(hl);

        addComponentsAndExpand(new Label(""));

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
