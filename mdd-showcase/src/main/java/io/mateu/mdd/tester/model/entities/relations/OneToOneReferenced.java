package io.mateu.mdd.tester.model.entities.relations;


import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.OneToOne;

@MateuMDDEntity
public class OneToOneReferenced {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @OneToOne(mappedBy = "referencedMapped")
    private OneToOneReferencer referencer;

    @OneToOne
    private OneToOneReferencer referencerMapper;

    @Override
    public String toString() {
        return getName();
    }
}
