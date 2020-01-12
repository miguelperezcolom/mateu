package io.mateu.mdd.tester.app.club.model;

import io.mateu.mdd.core.annotations.TextArea;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class OpcionServicio {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotEmpty
    private String nombre;

    @TextArea
    private String descripcion;

    private double precio;


    @ManyToOne
    private Servicio servicio;

    @ManyToOne
    private OpcionServicio parent;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "parent")
    private List<OpcionServicio> opciones = new ArrayList<>();


    @Override
    public String toString() {
        return nombre;
    }
}
