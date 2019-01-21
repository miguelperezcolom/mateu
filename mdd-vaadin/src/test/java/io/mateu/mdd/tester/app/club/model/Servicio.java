package io.mateu.mdd.tester.app.club.model;

import io.mateu.mdd.core.annotations.UseLinkToListView;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotEmpty
    private String nombre;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OpcionServicio> opciones = new ArrayList<>();

    @OneToMany(mappedBy = "servicio")
    @UseLinkToListView
    private List<Subscripcion> subscripciones= new ArrayList<>();


    @Override
    public String toString() {
        return nombre;
    }
}
