package io.mateu.mdd.test.model;

import com.google.common.collect.Lists;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter
public class Entidad {

    @Id@GeneratedValue
    private long id;

    private String nombre = "Entidad " + LocalDateTime.now();

    private LocalDateTime trigger = LocalDateTime.now();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evento> log = new ArrayList<>();


    @PostPersist@PostUpdate
    public void post() {
        if (trigger != null) {

            WorkflowEngine.add(() -> {

                System.out.println("tarea creada desde entidad.post()");

                Helper.transact(em -> {

                        Entidad e = em.find(Entidad.class, getId()); // em.merge(Entidad.this);
                        e.setLog(Helper.extend(log, new Evento()));
                        e.setTrigger(null);

                    });

            });

        }
    }





    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (id > 0 && obj != null && obj instanceof Entidad && id == ((Entidad) obj).getId());
    }

}
