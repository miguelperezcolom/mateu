package io.mateu.mdd.test.model;

import io.mateu.mdd.core.annotations.Code;
import io.mateu.mdd.core.annotations.FieldGroup;
import io.mateu.mdd.core.annotations.Html;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
@Slf4j
public class Entidad {

    @FieldGroup("G1")
    private String nombre = "Entidad " + LocalDateTime.now();

    private LocalDateTime trigger = LocalDateTime.now();

    private LocalDate fecha = LocalDate.now();

    private LocalDateTime fechaYHora = LocalDateTime.now();


    @FieldGroup("G2")
    @Html
    private String html;

    @Code
    private String codigo;


    @FieldGroup("G3")
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




}
