package io.mateu.mdd.vaadinport.vaadin.components.oauth;


import com.vaadin.server.ClassResource;
import com.vaadin.server.Page;
import com.vaadin.ui.Button;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class GitHubButton extends Button {

    //

    /*

    1 - Users are redirected to request their GitHub identity
    2 - Users are redirected back to your site by GitHub
    3 - Your app accesses the API with the user's access token


    GET https://github.com/login/oauth/authorize

    client_id	string	Required. The client ID you received from GitHub when you registered.
    redirect_uri	string	The URL in your application where users will be sent after authorization. See details below about redirect urls.
    scope	string	A space-delimited list of scopes. If not provided, scope defaults to an empty list for users that have not authorized any scopes for the application. For users who have authorized scopes for the application, the user won't be shown the OAuth authorization page with the list of scopes. Instead, this step of the mobile will automatically complete with the set of scopes the user has authorized for the application. For example, if a user has already performed the web mobile twice and has authorized one token with user scope and another token with repo scope, a third web mobile that does not provide a scope will receive a token with user and repo scope.
    state	string	An unguessable random string. It is used to protect against cross-site request forgery attacks.
    allow_signup	string	Whether or not unauthenticated users will be offered an option to sign up for GitHub during the OAuth mobile. The default is true. Use false in the case that a policy prohibits signups.


    POST https://github.com/login/oauth/access_token

    client_id	string	Required. The client ID you received from GitHub for your GitHub App.
    client_secret	string	Required. The client secret you received from GitHub for your GitHub App.
    code	string	Required. The code you received as a response to Step 1.
    redirect_uri	string	The URL in your application where users are sent after authorization.
    state	string	The unguessable random string you provided in Step 1.



CALLBACK: http://example.com/path

GOOD: http://example.com/path
GOOD: http://example.com/path/subdir/other
BAD:  http://example.com/bar
BAD:  http://example.com/
BAD:  http://example.com:8080/path
BAD:  http://oauth.example.com:8080/path
BAD:  http://example.org




    respuesta:

    access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&token_type=bearer

Accept: application/json
{"access_token":"e72e16c7e42f292c6912e7710c838347ae178b4a", "scope":"repo,gist", "token_type":"bearer"}

Accept: application/xml
<OAuth>
  <token_type>bearer</token_type>
  <scope>repo,gist</scope>
  <access_token>e72e16c7e42f292c6912e7710c838347ae178b4a</access_token>
</OAuth>



    GET https://api.github.com/user?access_token=...

    curl -H "Authorization: token OAUTH-TOKEN" https://api.github.com/user

     */

    public GitHubButton(String key, String secret) {
        super("Sign in with GitHub", new ClassResource("/images/github-logo-64.png"));

        addStyleName("signinbutton");

        addClickListener(e -> {

            Page p = MDDUI.get().getPage();

            String callbackUrl = p.getLocation().toString();
            /*
            if (!Strings.isNullOrEmpty(p.getLocation().getPath())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - p.getLocation().getPath().length());
            callbackUrl += "";
            */

            /*
            MDDUI.get().getPage().setLocation("https://github.com/login/oauth/authorize?client_id=" + key +
                    "&redirect_uri=" + callbackUrl.replaceAll("login", "callback"));
            */

            MDDUI.get().getPage().setLocation("https://github.com/login/oauth/authorize?client_id=" + key);

            /*
            // Create an opener extension
            BrowserWindowOpener opener =
                    new BrowserWindowOpener("https://github.com/login/oauth/authorize?client_id=" + key +
                            "&redirect_uri=" + callbackUrl
                    );
            opener.setFeatures("height=700,width=600,resizable");

            opener.extend(this);
            */

        });
    }

}
