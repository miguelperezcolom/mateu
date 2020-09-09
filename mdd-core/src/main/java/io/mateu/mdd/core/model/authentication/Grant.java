package io.mateu.mdd.core.model.authentication;

import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 * holder for a permission grant to user. It also defines the scope of the grant (e.g. a hotel, a customer, an office, ...)
 *
 * Created by miguel on 13/9/16.
 */
@Table(name = "_GRANT")@MateuMDDEntity
public class Grant {

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
