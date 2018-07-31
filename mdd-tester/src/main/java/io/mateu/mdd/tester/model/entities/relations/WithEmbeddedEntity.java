package io.mateu.mdd.tester.model.entities.relations;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter@Setter
public class WithEmbeddedEntity {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private long id;

    private String name;

    @Embedded
    private EmbeddableEntity embedded;

}
