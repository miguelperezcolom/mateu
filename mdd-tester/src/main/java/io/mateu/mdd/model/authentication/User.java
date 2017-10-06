package io.mateu.mdd.model.authentication;

import com.google.common.io.BaseEncoding;
import io.mateu.erp.model.util.Helper;
import io.mateu.mdd.model.common.File;
import io.mateu.mdd.model.finnancials.Actor;
import io.mateu.ui.mdd.server.annotations.*;
import io.mateu.ui.mdd.server.interfaces.WithTriggers;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.persistence.Table;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * holder for users of our erp. It can be an internal user or a user created for a customer or a supplier
 *
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Table(name = "_USER")
@Getter@Setter
public class User {

    @Id
    private String login;

    @Required
    private String name;

    @Required
    private String email;

    @Ignored
    private String password;

    @Required
    private USER_STATUS status;


    @Action(name = "Create token")
    public void createToken(EntityManager em, @Required Actor a) throws IOException {
        AuthToken t = new AuthToken();
        em.persist(t);
        t.setActor(a);
        t.setUser(this);
        t.setMaturity(null);
        t.setActive(true);

        t.setId("" + BaseEncoding.base64().encode(Helper.toJson(Helper.hashmap("actorId", "" + a.getId(), "user", getLogin())).getBytes()));
    }

}
