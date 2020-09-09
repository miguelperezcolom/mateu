package io.mateu.showcase.test.model;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;
import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
@Slf4j
public class Evento {

    @Id
    @GeneratedValue
    private long id;

    @NotEmpty
    private String texto;

    private LocalDateTime trigger = LocalDateTime.now();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tarea> tareas = new ArrayList<>();

    @PostPersist@PostUpdate
    public void post() {
        if (trigger != null) {

            WorkflowEngine.add(() -> {

                log.debug("tarea creada desde evento.post()");

                Helper.transact(em -> {

                    Evento e = em.merge(Evento.this);
                    e.setTareas(Helper.extend(tareas, new Tarea()));
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
        return this == obj || (id > 0 && obj != null && obj instanceof Evento && id == ((Evento) obj).getId());
    }

}
