package io.mateu.mdd.model.authentication;

import io.mateu.mdd.model.finnancials.Actor;
import io.mateu.ui.mdd.server.annotations.NewNotAllowed;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.Base64;
import java.util.Date;

@Entity
@Getter@Setter
@NewNotAllowed
public class AuthToken {

    @Id
    private String id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date maturity;

    private boolean active = true;

    @ManyToOne
    private User user;

    @ManyToOne
    private Actor actor;

    public String createId(User u) {
        Actor a = null;
        for (Permission p : u.getPermissions()) {
            //todo: relacinar con la agencia
        }
        //todo: utilizar jwt.io para encriptar
        return Base64.getEncoder().encodeToString(("{ created: '" + new Date() + "', userId: '" + u.getLogin() + "'" + ((getActor() != null)?", actorId: " + getActor().getId():"") + "}").getBytes());
    }

    public AuthToken renew(EntityManager em) {
        AuthToken t = new AuthToken();
        t.setId(t.createId(getUser()));
        t.setActive(true);
        t.setUser(getUser());
        t.setActor(getActor());
        em.persist(t);

        setMaturity(new Date(new Date().getTime() + 1l * 60l * 60l * 1000l));

        return t;
    }

}
