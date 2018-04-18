package io.mateu.mdd.model.authentication;

import com.google.common.io.BaseEncoding;
import io.mateu.erp.model.product.hotel.RoomType;
import io.mateu.erp.model.util.Helper;
import io.mateu.mdd.model.common.File;
import io.mateu.mdd.model.finnancials.Actor;
import io.mateu.mdd.model.finnancials.Currency;
import io.mateu.mdd.model.tests.owned.Propiedad;
import io.mateu.ui.mdd.server.annotations.*;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Embedded
    @Output
    private Audit audit = new Audit();

    /**
     * login must always be uppercase. It is the primary key.
     */
    @Id
    @ListColumn("Login")
    @Unmodifiable
    @NotNull
    @SearchFilter
    private String login;

    @ListColumn("Name")
    @NotNull
    @SearchFilter
    private String name;

    @ListColumn("Email")
    @NotNull
    @Separator("Xxxxx")
    @SearchFilter
    private String email;

    @Ignored
    private String password;

    @ListColumn("Status")
    @NotNull
    private USER_STATUS status;

    @Tab("Listas")
    @FullWidth
    @ElementCollection
    private List<String> akas = new ArrayList<>();

    @ElementCollection
    @ValueClass(RoomType.class)
    private List<String> habitaciones = new ArrayList<>();

    @ElementCollection
    private List<Integer> ints = new ArrayList<>();

    @ElementCollection
    private List<Long> longs = new ArrayList<>();

    @ElementCollection
    private List<Double> doubles = new ArrayList<>();

    @Tab("Mapas")
    @ElementCollection
    @MapLabels(labelForKey = "Hola", labelForValue = "Caracola")
    private Map<String, String> stringString = new HashMap<>();

    @ElementCollection
    @MapLabels(labelForKey = "Moneda", labelForValue = "Usuario")
    @KeyClass(Currency.class)
    @ValueClass(User.class)
    private Map<String, String> currencyUser = new HashMap<>();


    @ElementCollection
    private Map<Integer, String> integerString = new HashMap<>();

    @ElementCollection
    private Map<Boolean, Integer> booleanInteger = new HashMap<>();



    /*

    @ElementCollection
@CollectionTable(name="EMP_SENIORITY")
@MapKeyJoinColumn(name="EMP_ID")
@Column(name="SENIORITY")
private Map<Employee, Integer> seniorities;

     */

    @Tab("Más mapas")
    @ElementCollection
    @JoinTable(name = "_user_actor_string")
    private Map<Actor, String> actorString = new HashMap<>();

//    @ManyToMany
//    @JoinTable
//    private Map<String, Actor> stringActor = new HashMap<>();

    @OneToMany
    @JoinTable(name = "_user_currency_actor")
    private Map<Currency, Actor> currencyActor = new HashMap<>();

    @OneToMany
    @JoinTable(name = "_user_currency_propiedad")
    @OwnedList
    private Map<Currency, Propiedad> currencyPropiedad = new HashMap<>();


    @OneToMany
    @Ignored
    private List<Permission> permissions = new ArrayList<Permission>();


    @Ignored
    @ManyToOne
    private File photo;


    @Action(name = "Create token")
    public void createToken(EntityManager em, @NotNull Actor a) throws IOException {
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
    public static void testEstatico1(@NotNull @Caption("a") String a, @Caption("b")String b) {
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


    @PrePersist
    public void afterSet() throws Exception {
        setPassword("1");
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
