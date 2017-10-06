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
public class User implements WithTriggers {

    @Embedded
    @Output
    private Audit audit = new Audit();

    /**
     * login must always be uppercase. It is the primary key.
     */
    @Id
    @ListColumn("Login")
    @Unmodifiable
    @Required
    private String login;

    @ListColumn("Name")
    @Required
    private String name;

    @ListColumn("Email")
    @Required
    private String email;

    @Ignored
    private String password;

    @ListColumn("Status")
    @Required
    private USER_STATUS status;


    @OneToMany
    @Ignored
    private List<Permission> permissions = new ArrayList<Permission>();


    @Ignored
    @ManyToOne
    private File photo;


    @Action(name = "Create token")
    public void createToken(EntityManager em, @Required Actor a) throws IOException {
        AuthToken t = new AuthToken();
        em.persist(t);
        t.setActor(a);
        t.setUser(this);
        t.setMaturity(null);
        t.setActive(true);

        t.setId("" + BaseEncoding.base64().encode(Helper.toJson(Helper.hashmap("actorId", "" + a.getId(), "user", getLogin())).getBytes()));
        System.out.println("token creado para el usuario " + getLogin() + " y el actor " + a.getName() + ": " + t.getId());
    }

    @Action(name = "test est. 1")
    public static void testEstatico1(@Required @Caption("a") String a, @Caption("b")String b) {
        System.out.println("testEstatico1(" + a + ", " + b + ")");
    }

    @Action(name = "test est. 2")
    public static String testEstatico2(String a, String b) {
        System.out.println("testEstatico2(" + a + ", " + b + ")");
        return "" + a + b;
    }

    @Action(name = "test 1")
    public void test1(String a, String b) {
        System.out.println("test1(" + a + ", " + b + ")");
    }

    @Action(name = "test 2")
    public String test2(String a, String b) {
        System.out.println("test2(" + a + ", " + b + ")");
        return "" + a + b;
    }

    @Override
    public void beforeSet(EntityManager em, boolean isNew) throws Exception {

    }

    @Override
    public void afterSet(EntityManager em, boolean isNew) throws Exception {
        setPassword("1");
    }

    @Override
    public void beforeDelete(EntityManager em) throws Exception {

    }

    @Override
    public void afterDelete(EntityManager em) throws Exception {

    }

    public String createToken(EntityManager em) {
        AuthToken t = new AuthToken();
        t.setId(t.createId(this));
        t.setActive(true);
        t.setUser(this);
        em.persist(t);
        return t.getId();
    }
}
