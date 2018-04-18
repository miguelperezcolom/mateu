package io.mateu.mdd.model.tests.onetomanyowned;

import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.annotations.ListColumn;
import io.mateu.ui.mdd.server.annotations.OwnedList;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
public class UnoOwned {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    @SearchFilter
    @ListColumn
    private String name;

    @OneToMany(mappedBy = "uno")
    @OwnedList
    private List<LineaOwned> hijos;

    private String test;


    @Action(name = "Provocar error")
    public void provocarExcepcion() throws Throwable {
        throw new Exception("Ups! ha ocurrido un error...");
    }

}
