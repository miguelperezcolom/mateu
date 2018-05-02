package io.mateu.mdd.model.pocs;

import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;
import lombok.Getter;
import lombok.Setter;
import org.eclipse.persistence.annotations.CacheIndex;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class D {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @CacheIndex
    private String name;

    @ManyToOne
    private C c;

    public D() {

    }

    public D(C c) {
        this.c = c;
    }


    @PrePersist
    public void pre() {

        setName("Esto es una D " + LocalDateTime.now());

    }

    @PostPersist
    public void despues() {
        System.out.println("después");
    }

    @PostUpdate
    public void preu() throws Throwable {

        EntityManager em = Helper.getEMFromThreadLocal();

        if (em.getTransaction().isActive()) {
            System.out.println("transaccion activa");
        } else {
            System.out.println("transacción cerrada");
        }


        System.out.println("C::::preupdate");

        System.out.println("name=" + getC().getName().length());


        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                D d = em.find(D.class, getId());
                d.getC().setName(d.getC().getName() + "/ -> " + LocalDateTime.now());
            }
        });


        System.out.println("name=" + getC().getName().length());


    }

}
