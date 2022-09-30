package io.mateu.mdd.core.model.authentication;


import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity@Getter@Setter@EqualsAndHashCode(of = "id")
public class AdminUser extends User {

    @Id@GeneratedValue
    private long id;

    public AdminUser() {

    }

    public AdminUser(String login) {
        setLogin(login);
    }

}
