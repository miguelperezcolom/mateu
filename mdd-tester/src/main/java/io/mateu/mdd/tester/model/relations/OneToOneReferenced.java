package io.mateu.mdd.tester.model.relations;


import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class OneToOneReferenced {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @OneToOne(mappedBy = "referencedMapped")
    private OneToOneReferencer referencer;

    @OneToOne
    private OneToOneReferencer referencerMapper;
}
