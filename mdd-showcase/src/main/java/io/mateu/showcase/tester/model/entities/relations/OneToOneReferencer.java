package io.mateu.showcase.tester.model.entities.relations;


import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
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


    @OneToOne
    private OneToOneReferenced referencedMapped;

    @OneToOne(mappedBy = "referencerMapper")
    private OneToOneReferenced referencedMapper;

}
