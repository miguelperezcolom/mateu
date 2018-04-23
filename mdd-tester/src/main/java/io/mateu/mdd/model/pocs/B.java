package io.mateu.mdd.model.pocs;

import io.mateu.ui.mdd.server.util.Helper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class B {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;


    @PrePersist
    public void pre() {

        EntityManager em = Helper.getEMFromThreadLocal();

        C c = new C();

        c.setName("Esto es una C " + LocalDateTime.now());

        em.persist(c);

    }

}
