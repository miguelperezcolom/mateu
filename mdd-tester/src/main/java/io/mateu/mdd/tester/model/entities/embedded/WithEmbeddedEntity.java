package io.mateu.mdd.tester.model.entities.embedded;

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
    @AttributeOverrides({
            @AttributeOverride(name="name", column=@Column(name="emb_name")),
            @AttributeOverride(name="age", column=@Column(name="emb_age"))})
    private EmbeddableEntity embedded = new EmbeddableEntity();


    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name="name", column=@Column(name="emb2_name"))})
    private EmbeddableAbstractEntity embedded2 = new EmbeddableSubclassedEntity1();


}
