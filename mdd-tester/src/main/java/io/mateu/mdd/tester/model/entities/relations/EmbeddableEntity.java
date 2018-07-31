package io.mateu.mdd.tester.model.entities.relations;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Getter@Setter
@Embeddable
public class EmbeddableEntity {

    private String name;

    private int age;

}
