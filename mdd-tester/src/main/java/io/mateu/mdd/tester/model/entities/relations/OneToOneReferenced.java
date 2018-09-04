package io.mateu.mdd.tester.model.entities.relations;


import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

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

    @Override
    public String toString() {
        return getName();
    }
}
