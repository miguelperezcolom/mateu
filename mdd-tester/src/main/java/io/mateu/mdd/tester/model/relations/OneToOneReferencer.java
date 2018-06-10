package io.mateu.mdd.tester.model.relations;


import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class OneToOneReferencer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @OneToOne
    private OneToOneReferenced referenced;


    @OneToOne
    @NotNull
    private OneToOneReferenced referencedNotNull;


    @OneToOne(mappedBy = "referencer")
    private OneToOneReferenced referencedMapped;

}
