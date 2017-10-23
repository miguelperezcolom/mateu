package io.mateu.mdd.model.tests.onetomany;

import io.mateu.mdd.model.tests.owned.NoEntity;
import io.mateu.ui.mdd.server.annotations.*;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.List;

@Entity
@Getter@Setter
public class Uno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Required
    @SearchFilter
    @ListColumn
    private String name;

    @OneToMany
    @OwnedList
    private List<Linea> hijo;


    @Action(name = "Provocar error")
    public void provocarExcepcion() throws Throwable {
        throw new Exception("Ups! ha ocurrido un error...");
    }

}
