package io.mateu.mdd.model.pocs;

import io.mateu.ui.mdd.server.util.Helper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity@Getter@Setter
public class A {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @PrePersist
    public void pre() {

        EntityManager em = Helper.getEMFromThreadLocal();

        B b = new B();

        b.setName("Esto es una B " + LocalDateTime.now());

        em.persist(b);

    }


}
