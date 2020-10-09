package io.mateu.mdd.vaadin.components.oauth;


import com.vaadin.server.ClassResource;
import com.vaadin.server.Page;
import com.vaadin.ui.Button;
import com.vaadin.ui.UI;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.VaadinHelper;
import io.mateu.util.notification.Notifier;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

public class GoogleButton extends Button {

    //

    public GoogleButton(String key, String secret) {
        super("Sign in with Google", new ClassResource("/images/google-logo-64.png"));

        addStyleName("signinbutton");


        addClickListener(e -> {

            Page p = UI.getCurrent().getPage();

            //String callbackUrl = p.getLocation().toString();
            String callbackUrl = MDDUIAccessor.getBaseUrl();

//            if (!Strings.isNullOrEmpty(p.getLocation().getPath())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - p.getLocation().getPath().length());
//            callbackUrl += "";

            if (!callbackUrl.endsWith("/")) callbackUrl += "/";
            if (!callbackUrl.endsWith(VaadinHelper.getAdaptedUIRootPath())) callbackUrl += VaadinHelper.getAdaptedUIRootPath();
            callbackUrl += "oauth/google/callback";


            try {
                UI.getCurrent().getPage().setLocation("https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=" + key
                        + "&redirect_uri=" + URLEncoder.encode(callbackUrl, "iso-8859-1") + "&scope=" + URLEncoder.encode("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile", "iso-8859-1"));
            } catch (UnsupportedEncodingException e1) {
                Notifier.alert(e1);
            }

        });
    }

}
