package io.mateu.mdd.model.tests.multiidioma;


import io.mateu.erp.model.multilanguage.Literal;
import io.mateu.ui.mdd.server.annotations.Help;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
public class Traducido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @SearchFilter
    @Help("Full name of the user")
    private String name;

    private int entero;

    private double doble;

    @ManyToOne(cascade = CascadeType.ALL)
    private Literal texto1;

    @ManyToOne(cascade = CascadeType.ALL)
    private Literal texto2;
}
