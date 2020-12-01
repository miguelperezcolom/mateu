package io.mateu.mdd.core.model.authentication;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class AdminUser extends User {

    public AdminUser() {

    }

    public AdminUser(String login) {
        setLogin(login);
    }

}
