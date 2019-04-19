package io.mateu.mdd.core.data;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by miguel on 25/1/17.
 */
public class UserData extends Data implements Serializable {


    public UserData(String json) throws IOException {
        super(json);
    }

    public UserData() {
        super();
        setPermissions(new ArrayList<>());
    }

    public String getLogin() {
        return get("login");
    }

    public void setLogin(String login) {
        set("login", login != null?login.toLowerCase():null);
    }

    public String getEmail() {
        return get("email");
    }

    public void setEmail(String email) {
        set("email", email);
    }

    public String getName() {
        return get("name");
    }

    public void setName(String name) {
        set("name", name);
    }

    public List<Integer> getPermissions() {
        return get("permissions");
    }

    public void setPermissions(List<Integer> permissions) {
        set("permissions", permissions);
    }

    public Data getData() {
        return get("data");
    }

    public void setData(Data data) {
        set("data", data);
    }

    public String getPhoto() {
        return get("photo");
    }

    public void setPhoto(String photo) {
        set("photo", photo);
    }

    public String getPreferredLanguage() {
        return get("preferredLanguage");
    }

    public void setPreferredLanguage(String preferredLanguage) {
        set("preferredLanguage", preferredLanguage);
    }

}
