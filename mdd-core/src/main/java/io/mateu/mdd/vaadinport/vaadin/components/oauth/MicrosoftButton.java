package io.mateu.mdd.vaadinport.vaadin.components.oauth;


import com.google.common.base.Strings;
import com.vaadin.server.ClassResource;
import com.vaadin.server.Page;
import com.vaadin.ui.Button;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

public class MicrosoftButton extends Button {

    //

    /*


https://docs.microsoft.com/es-es/azure/active-directory/develop/active-directory-v2-protocols-oauth-code


// Line breaks for legibility only

https://login.microsoftonline.com/{tenant}/oauth2/authorize?
client_id=6731de76-14a6-49ae-97bc-6eba6914391e
&response_type=code
&redirect_uri=http%3A%2F%2Flocalhost%3A%12345
&response_mode=query
&resource=https%3A%2F%2Fservice.contoso.com%2F
&state=12345

     */

    public MicrosoftButton(String key, String secret) {
        super("Sign in with Microsoft", new ClassResource("/images/microsoft-logo-64.png"));

        addStyleName("signinbutton");


        addClickListener(e -> {

            Page p = MDDUI.get().getPage();

            String callbackUrl = p.getLocation().toString();

            if (!Strings.isNullOrEmpty(p.getLocation().getPath())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - p.getLocation().getPath().length());
            callbackUrl += "";

            if (!callbackUrl.endsWith("/")) callbackUrl += "/";
            if (!callbackUrl.endsWith("app/")) callbackUrl += "app/";
            callbackUrl += "oauth/microsoft/callback";


            try {
                MDDUI.get().getPage().setLocation("https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=" + key
                        + "&redirect_uri=" + URLEncoder.encode(callbackUrl, "iso-8859-1") + "&scope=" + URLEncoder.encode("email profile openid", "iso-8859-1"));
            } catch (UnsupportedEncodingException e1) {
                MDD.alert(e1);
            }


        });
    }

}
