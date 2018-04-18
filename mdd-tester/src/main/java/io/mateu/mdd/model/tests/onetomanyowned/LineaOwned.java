package io.mateu.mdd.model.tests.onetomanyowned;

import io.mateu.ui.mdd.server.annotations.ListColumn;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class LineaOwned {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @NotNull
    private UnoOwned uno;

    @NotNull
    @SearchFilter
    @ListColumn
    private String name;

    private int age;

    private boolean active;

    //private int[] ages;

}
