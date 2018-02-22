package io.mateu.mdd.model.tests.usaridparaseleccionar;


import io.mateu.ui.mdd.server.annotations.UseIdToSelect;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
public class Referenciador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;


    @ManyToOne
    private Referenciado ref;


}
