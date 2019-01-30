package io.mateu.mdd.vaadinport.vaadin.components.oauth;


import com.google.common.base.Strings;
import com.vaadin.server.ClassResource;
import com.vaadin.server.Page;
import com.vaadin.ui.Button;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

public class GoogleButton extends Button {

    //

    public GoogleButton(String key, String secret) {
        super("Sign in with Google", new ClassResource("/images/google-logo-64.png"));

        addStyleName("signinbutton");


        addClickListener(e -> {

            Page p = MDDUI.get().getPage();

            String callbackUrl = p.getLocation().toString();

            if (!Strings.isNullOrEmpty(p.getLocation().getPath())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - p.getLocation().getPath().length());
            callbackUrl += "";

            if (!callbackUrl.endsWith("/")) callbackUrl += "/";
            callbackUrl += "app/oauth/google/callback";


            try {
                MDDUI.get().getPage().setLocation("https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=" + key
                        + "&redirect_uri=" + URLEncoder.encode(callbackUrl, "iso-8859-1") + "&scope=" + URLEncoder.encode("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile", "iso-8859-1"));
            } catch (UnsupportedEncodingException e1) {
                MDD.alert(e1);
            }

        });
    }

}
