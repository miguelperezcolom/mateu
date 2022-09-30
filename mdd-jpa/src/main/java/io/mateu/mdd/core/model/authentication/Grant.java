package io.mateu.mdd.core.model.authentication;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

/**
 * holder for a permission grant to user. It also defines the scope of the grant (e.g. a hotel, a customer, an office, ...)
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@Table(name = "_GRANT")
public class Grant {

    @Id
    @GeneratedValue
    private long id;

    @ManyToOne
    private Permission permission;

    @ManyToOne
    private User user;

    public Grant(User u, Permission p) {
        setUser(u);
        setPermission(p);
    }

    public Grant() {

    }

    //TODO: add scope (hotel, office, ...)
}
