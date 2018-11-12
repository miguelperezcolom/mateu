package io.mateu.mdd.vaadinport.vaadin.components.oauth;

import com.google.common.base.Strings;
import com.vaadin.server.Page;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.model.authentication.Permission;
import io.mateu.mdd.core.model.authentication.USER_STATUS;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import okhttp3.*;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.Map;

public class OAuthHelper {


    public static UserData getUserDataFromMicrosoftCode(String code) throws Throwable {
        UserData[] ud = { null };

        /*
        POST /oauth2/v4/token HTTP/1.1
Host: www.googleapis.com
Content-Type: application/x-www-form-urlencoded

code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7&
client_id=your_client_id&
client_secret=your_client_secret&
redirect_uri=https://oauth2.example.com/code&
grant_type=authorization_code
         */

        if (!Strings.isNullOrEmpty(code)) {

            String apiKey = System.getProperty("oauth.microsoft.client_id");
            String apiSecret = System.getProperty("oauth.microsoft.client_secret");

            String access_token = null;


            Page p = Page.getCurrent();

            String callbackUrl = p.getLocation().toString();

            if (!Strings.isNullOrEmpty(p.getLocation().getQuery())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - (p.getLocation().getQuery().length() + 1));
            if (!Strings.isNullOrEmpty(p.getLocation().getPath())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - p.getLocation().getPath().length());
            callbackUrl += "";

            if (!callbackUrl.endsWith("/")) callbackUrl += "/";
            callbackUrl += "oauth/google/callback";


            OkHttpClient client = new OkHttpClient();

            {

                RequestBody formBody = new FormBody.Builder()
                        .add("client_id", apiKey)
                        .add("client_secret", apiSecret)
                        .add("code", code)
                        .add("redirect_uri", callbackUrl)
                        .add("grant_type", "authorization_code")
                        .build();
                Request request = new Request.Builder()
                        .url("https://www.googleapis.com/oauth2/v4/token")
                        .post(formBody)
                        .build();

                System.out.println("request=" + request);



                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                    String rb = response.body().string();

                    System.out.println("" + rb);

                    Map<String, Object> m = Helper.fromJson(rb);

                    System.out.println("" + m);

                    access_token = (String) m.get("access_token");

                    System.out.println("access_token=" + access_token);
                }

            }


            //access_token=321ad41cf16c46a77f0697c48bc47b21cd0b47c7&scope=&token_type=bearer




            {


                Request request = new Request.Builder()
                        .url("https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" + access_token)
                        .get()
                        .build();

                System.out.println("request=" + request);


                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                    String rb = response.body().string();

                    System.out.println("response=" + rb);

                    Map<String, Object> m = Helper.fromJson(rb);

                /*

{
  "login": "miguelperezcolom",
  "id": 20686545,
  "node_id": "MDQ6VXNlcjIwNjg2NTQ1",
  "avatar_url": "https://avatars2.githubusercontent.com/u/20686545?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/miguelperezcolom",
  "html_url": "https://github.com/miguelperezcolom",
  "followers_url": "https://api.github.com/users/miguelperezcolom/followers",
  "following_url": "https://api.github.com/users/miguelperezcolom/following{/other_user}",
  "gists_url": "https://api.github.com/users/miguelperezcolom/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/miguelperezcolom/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/miguelperezcolom/subscriptions",
  "organizations_url": "https://api.github.com/users/miguelperezcolom/orgs",
  "repos_url": "https://api.github.com/users/miguelperezcolom/repos",
  "events_url": "https://api.github.com/users/miguelperezcolom/events{/privacy}",
  "received_events_url": "https://api.github.com/users/miguelperezcolom/received_events",
  "type": "User",
  "site_admin": false,
  "value": "Miguel Pérez Colom",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": "Project manager at Multinucleo",
  "public_repos": 31,
  "public_gists": 0,
  "followers": 1,
  "following": 0,
  "created_at": "2016-07-27T16:18:08Z",
  "updated_at": "2018-07-15T08:30:16Z"
}

                 */

                    String avatarUrl = (String) m.get("picture");
                    String name = (String) m.get("name");
                    String email = (String) m.get("email");
                    String login = (String) m.get("email");

                    System.out.println("" + avatarUrl);
                    System.out.println("" + name);
                    System.out.println("" + email); // puede ser null
                    System.out.println("" + login);

                    Helper.transact(new JPATransaction() {
                        @Override
                        public void run(EntityManager em) throws Throwable {

                            User u = em.find(User.class, login);

                            UserData d = new UserData();

                            if (u == null) {
                                u = new User();
                                u.setOauth(true);
                                u.setLogin(login);
                                u.setEmail((email != null)?email:"");
                                u.setName((name != null)?name:"");
                                if (!Strings.isNullOrEmpty(avatarUrl)) u.setPhoto(new Resource(new URL(avatarUrl)));
                                u.setStatus(USER_STATUS.ACTIVE);
                                em.persist(u);
                            }
                            u.setLastLogin(LocalDateTime.now());


                            d.setName(u.getName());
                            d.setEmail(u.getEmail());
                            d.setLogin(login);
                            if (u.getPhoto() != null) d.setPhoto(u.getPhoto().toFileLocator().getUrl());
                            for (Permission p : u.getPermissions()) d.getPermissions().add(Math.toIntExact(p.getId()));

                            ud[0] = d;

                        }
                    });

                }

            }



        }

        return ud[0];
    }


    public static UserData getUserDataFromGoogleCode(String code) throws Throwable {
        UserData[] ud = { null };

        /*
        POST /oauth2/v4/token HTTP/1.1
Host: www.googleapis.com
Content-Type: application/x-www-form-urlencoded

code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7&
client_id=your_client_id&
client_secret=your_client_secret&
redirect_uri=https://oauth2.example.com/code&
grant_type=authorization_code
         */

        if (!Strings.isNullOrEmpty(code)) {

            String apiKey = System.getProperty("oauth.google.client_id");
            String apiSecret = System.getProperty("oauth.google.client_secret");

            String access_token = null;


            Page p = Page.getCurrent();

            String callbackUrl = p.getLocation().toString();

            if (!Strings.isNullOrEmpty(p.getLocation().getQuery())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - (p.getLocation().getQuery().length() + 1));
            if (!Strings.isNullOrEmpty(p.getLocation().getPath())) callbackUrl = callbackUrl.substring(0, callbackUrl.length() - p.getLocation().getPath().length());
            callbackUrl += "";

            if (!callbackUrl.endsWith("/")) callbackUrl += "/";
            callbackUrl += "oauth/google/callback";


            OkHttpClient client = new OkHttpClient();

            {

                RequestBody formBody = new FormBody.Builder()
                        .add("client_id", apiKey)
                        .add("client_secret", apiSecret)
                        .add("code", code)
                        .add("redirect_uri", callbackUrl)
                        .add("grant_type", "authorization_code")
                        .build();
                Request request = new Request.Builder()
                        .url("https://www.googleapis.com/oauth2/v4/token")
                        .post(formBody)
                        .build();

                System.out.println("request=" + request);


                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                    String rb = response.body().string();

                    System.out.println("" + rb);

                    Map<String, Object> m = Helper.fromJson(rb);

                    System.out.println("" + m);

                    access_token = (String) m.get("access_token");

                    System.out.println("access_token=" + access_token);
                }

            }


            //access_token=321ad41cf16c46a77f0697c48bc47b21cd0b47c7&scope=&token_type=bearer




            {


                Request request = new Request.Builder()
                        .url("https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" + access_token)
                        .get()
                        .build();

                System.out.println("request=" + request);


                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                    String rb = response.body().string();

                    System.out.println("response=" + rb);

                        Map<String, Object> m = Helper.fromJson(rb);

                /*

{
  "login": "miguelperezcolom",
  "id": 20686545,
  "node_id": "MDQ6VXNlcjIwNjg2NTQ1",
  "avatar_url": "https://avatars2.githubusercontent.com/u/20686545?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/miguelperezcolom",
  "html_url": "https://github.com/miguelperezcolom",
  "followers_url": "https://api.github.com/users/miguelperezcolom/followers",
  "following_url": "https://api.github.com/users/miguelperezcolom/following{/other_user}",
  "gists_url": "https://api.github.com/users/miguelperezcolom/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/miguelperezcolom/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/miguelperezcolom/subscriptions",
  "organizations_url": "https://api.github.com/users/miguelperezcolom/orgs",
  "repos_url": "https://api.github.com/users/miguelperezcolom/repos",
  "events_url": "https://api.github.com/users/miguelperezcolom/events{/privacy}",
  "received_events_url": "https://api.github.com/users/miguelperezcolom/received_events",
  "type": "User",
  "site_admin": false,
  "value": "Miguel Pérez Colom",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": "Project manager at Multinucleo",
  "public_repos": 31,
  "public_gists": 0,
  "followers": 1,
  "following": 0,
  "created_at": "2016-07-27T16:18:08Z",
  "updated_at": "2018-07-15T08:30:16Z"
}

                 */

                    String avatarUrl = (String) m.get("picture");
                    String name = (String) m.get("name");
                    String email = (String) m.get("email");
                    String login = (String) m.get("email");

                    System.out.println("" + avatarUrl);
                    System.out.println("" + name);
                    System.out.println("" + email); // puede ser null
                    System.out.println("" + login);

                    Helper.transact(new JPATransaction() {
                        @Override
                        public void run(EntityManager em) throws Throwable {

                            User u = em.find(User.class, login);

                            UserData d = new UserData();

                            if (u == null) {
                                u = new User();
                                u.setOauth(true);
                                u.setLogin(login);
                                u.setEmail((email != null)?email:"");
                                u.setName((name != null)?name:"");
                                if (!Strings.isNullOrEmpty(avatarUrl)) u.setPhoto(new Resource(new URL(avatarUrl)));
                                u.setStatus(USER_STATUS.ACTIVE);
                                em.persist(u);
                            }
                            u.setLastLogin(LocalDateTime.now());


                            d.setName(u.getName());
                            d.setEmail(u.getEmail());
                            d.setLogin(login);
                            if (u.getPhoto() != null) d.setPhoto(u.getPhoto().toFileLocator().getUrl());
                            for (Permission p : u.getPermissions()) d.getPermissions().add(Math.toIntExact(p.getId()));

                            ud[0] = d;

                        }
                    });

                }

            }



        }

        return ud[0];
    }


    public static UserData getUserDataFromGitHubCode(String code) throws Throwable {
        UserData[] ud = { null };

        if (!Strings.isNullOrEmpty(code)) {

            String apiKey = System.getProperty("oauth.github.client_id");
            String apiSecret = System.getProperty("oauth.github.client_secret");

            String access_token = null;


            OkHttpClient client = new OkHttpClient();

            {

                RequestBody formBody = new FormBody.Builder()
                        .add("client_id", apiKey)
                        .add("client_secret", apiSecret)
                        .add("code", code)
                        .build();
                Request request = new Request.Builder()
                        .url("https://github.com/login/oauth/access_token")
                        .post(formBody)
                        .build();

                System.out.println("request=" + request);
                for (int i = 0; i < ((FormBody) formBody).size(); i++) System.out.println("" + ((FormBody) formBody).name(i) + "=" + ((FormBody) formBody).value(i));

                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                    String rb = response.body().string();

                    System.out.println("" + rb);

                    Map<String, String> m = Helper.parseQueryString(rb);

                    System.out.println("" + m);

                    access_token = m.get("access_token");

                    System.out.println("access_token=" + access_token);
                }

            }


            //access_token=321ad41cf16c46a77f0697c48bc47b21cd0b47c7&scope=&token_type=bearer




            {


                Request request = new Request.Builder()
                        .url("https://api.github.com/user?access_token=" + access_token)
                        .get()
                        .build();

                System.out.println("request=" + request);


                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                    String rb = response.body().string();

                    System.out.println("response=" + rb);

                    Map<String, Object> m = Helper.fromJson(rb);

                /*

{
  "login": "miguelperezcolom",
  "id": 20686545,
  "node_id": "MDQ6VXNlcjIwNjg2NTQ1",
  "avatar_url": "https://avatars2.githubusercontent.com/u/20686545?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/miguelperezcolom",
  "html_url": "https://github.com/miguelperezcolom",
  "followers_url": "https://api.github.com/users/miguelperezcolom/followers",
  "following_url": "https://api.github.com/users/miguelperezcolom/following{/other_user}",
  "gists_url": "https://api.github.com/users/miguelperezcolom/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/miguelperezcolom/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/miguelperezcolom/subscriptions",
  "organizations_url": "https://api.github.com/users/miguelperezcolom/orgs",
  "repos_url": "https://api.github.com/users/miguelperezcolom/repos",
  "events_url": "https://api.github.com/users/miguelperezcolom/events{/privacy}",
  "received_events_url": "https://api.github.com/users/miguelperezcolom/received_events",
  "type": "User",
  "site_admin": false,
  "value": "Miguel Pérez Colom",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": "Project manager at Multinucleo",
  "public_repos": 31,
  "public_gists": 0,
  "followers": 1,
  "following": 0,
  "created_at": "2016-07-27T16:18:08Z",
  "updated_at": "2018-07-15T08:30:16Z"
}

                 */

                String avatarUrl = (String) m.get("avatar_url");
                    String name = (String) m.get("name");
                    String email = (String) m.get("email");
                    String login = (String) m.get("login");

                    System.out.println("" + avatarUrl);
                    System.out.println("" + name);
                    System.out.println("" + email); // puede ser null
                    System.out.println("" + login);

                    Helper.transact(new JPATransaction() {
                        @Override
                        public void run(EntityManager em) throws Throwable {

                            User u = em.find(User.class, login);

                            UserData d = new UserData();

                            if (u == null) {
                                u = new User();
                                u.setOauth(true);
                                u.setLogin(login);
                                u.setEmail((email != null)?email:"");
                                u.setName((name != null)?name:"");
                                if (!Strings.isNullOrEmpty(avatarUrl)) u.setPhoto(new Resource(new URL(avatarUrl)));
                                u.setStatus(USER_STATUS.ACTIVE);
                                em.persist(u);
                            }
                            u.setLastLogin(LocalDateTime.now());

                            d.setName(u.getName());
                            d.setEmail(u.getEmail());
                            d.setLogin(login);
                            if (u.getPhoto() != null) d.setPhoto(u.getPhoto().toFileLocator().getUrl());
                            for (Permission p : u.getPermissions()) d.getPermissions().add(Math.toIntExact(p.getId()));

                            ud[0] = d;

                        }
                    });

                }

            }



        }

        return ud[0];
    }

    public static void main(String[] args) throws IOException {
        test1();
    }

    private static void test1() throws IOException {


        String apiKey = "2043fd5fdff6f9986731";
        String apiSecret = "1220c641ac37d215f79dded684476e4ebb5a6c43";

        String code = "51c9523d57382879f8ee";



        String access_token = null;


        OkHttpClient client = new OkHttpClient();

        {

            RequestBody formBody = new FormBody.Builder()
                    .add("client_id", apiKey)
                    .add("client_secret", apiSecret)
                    .add("code", code)
                    .build();
            Request request = new Request.Builder()
                    .url("https://github.com/login/oauth/access_token")
                    .post(formBody)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                String rb = response.body().string();

                Map<String, String> m = Helper.parseQueryString(rb);

                System.out.println("" + m);

                access_token = m.get("access_token");

                System.out.println("access_token=" + access_token);
            }

        }


        //access_token=321ad41cf16c46a77f0697c48bc47b21cd0b47c7&scope=&token_type=bearer




        {


            Request request = new Request.Builder()
                    .url("https://api.github.com/user?access_token=" + access_token)
                    .get()
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

                String rb = response.body().string();

                System.out.println("response=" + rb);

                Map<String, Object> m = Helper.fromJson(rb);

                /*

{
  "login": "miguelperezcolom",
  "id": 20686545,
  "node_id": "MDQ6VXNlcjIwNjg2NTQ1",
  "avatar_url": "https://avatars2.githubusercontent.com/u/20686545?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/miguelperezcolom",
  "html_url": "https://github.com/miguelperezcolom",
  "followers_url": "https://api.github.com/users/miguelperezcolom/followers",
  "following_url": "https://api.github.com/users/miguelperezcolom/following{/other_user}",
  "gists_url": "https://api.github.com/users/miguelperezcolom/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/miguelperezcolom/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/miguelperezcolom/subscriptions",
  "organizations_url": "https://api.github.com/users/miguelperezcolom/orgs",
  "repos_url": "https://api.github.com/users/miguelperezcolom/repos",
  "events_url": "https://api.github.com/users/miguelperezcolom/events{/privacy}",
  "received_events_url": "https://api.github.com/users/miguelperezcolom/received_events",
  "type": "User",
  "site_admin": false,
  "value": "Miguel Pérez Colom",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": "Project manager at Multinucleo",
  "public_repos": 31,
  "public_gists": 0,
  "followers": 1,
  "following": 0,
  "created_at": "2016-07-27T16:18:08Z",
  "updated_at": "2018-07-15T08:30:16Z"
}

                 */


                System.out.println("" + m.get("avatar_url"));
                System.out.println("" + m.get("name"));
                System.out.println("" + m.get("email")); // puede ser null
                System.out.println("" + m.get("login"));

            }

        }

    }

}
