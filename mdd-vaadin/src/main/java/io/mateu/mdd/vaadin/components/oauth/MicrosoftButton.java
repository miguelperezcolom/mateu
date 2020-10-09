package io.mateu.mdd.vaadin.components.oauth;


import com.google.common.base.Strings;
import com.vaadin.server.ClassResource;
import com.vaadin.server.Page;
import com.vaadin.ui.Button;
import com.vaadin.ui.UI;
import io.mateu.mdd.shared.VaadinHelper;
import io.mateu.util.notification.Notifier;

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

            Page p = UI.getCurrent().getPage();

            String callbackUrl = p.getLocation().toString();

            if (!Strings.isNullOrEmpty(p.getLocation().getPath())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - p.getLocation().getPath().length());
            callbackUrl += "";

            if (!callbackUrl.endsWith("/")) callbackUrl += "/";
            if (!callbackUrl.endsWith(VaadinHelper.getAdaptedUIRootPath())) callbackUrl += VaadinHelper.getAdaptedUIRootPath();
            callbackUrl += "oauth/microsoft/callback";


            try {
                UI.getCurrent().getPage().setLocation("https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=" + key
                        + "&redirect_uri=" + URLEncoder.encode(callbackUrl, "iso-8859-1") + "&scope=" + URLEncoder.encode("email profile openid", "iso-8859-1"));
            } catch (UnsupportedEncodingException e1) {
                Notifier.alert(e1);
            }


        });
    }

}
