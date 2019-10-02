package io.mateu.mdd.core.model.authentication;

import lombok.Getter;
import lombok.MateuMDDEntity;
import lombok.Setter;

import javax.persistence.*;

/**
 * holder for a permission grant to user. It also defines the scope of the grant (e.g. a hotel, a customer, an office, ...)
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Table(name = "_GRANT")
@Getter@Setter@MateuMDDEntity
public class Grant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
