package io.mateu.mdd.test.model;

import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.Code;
import io.mateu.mdd.core.annotations.Html;
import io.mateu.mdd.core.annotations.NotInList;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter
@Slf4j
public class Entidad {

    @Id@GeneratedValue
    private long id;

    private String nombre = "Entidad " + LocalDateTime.now();

    private LocalDateTime trigger = LocalDateTime.now();

    private LocalDate fecha = LocalDate.now();

    private LocalDateTime fechaYHora = LocalDateTime.now();


    @Html
    private String html;

    @Code
    private String codigo;


    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evento> _log = new ArrayList<>();

    @NotNull
    @OneToOne
    private EntidadReferenciada unoAUno;


    @NotNull
    @OneToOne(mappedBy = "unoAUnoInverso")
    private EntidadReferenciada unoAUnoBidireccional;

    @PostPersist@PostUpdate
    public void post() {
        if (trigger != null) {

            WorkflowEngine.add(() -> {

                log.debug("tarea creada desde entidad.post()");

                Helper.transact(em -> {

                        Entidad e = em.find(Entidad.class, getId()); // em.merge(Entidad.this);
                        e.set_log(Helper.extend(_log, new Evento()));
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

    @Override
    public String toString() {
        return nombre != null?nombre:"E " + id;
    }
}
