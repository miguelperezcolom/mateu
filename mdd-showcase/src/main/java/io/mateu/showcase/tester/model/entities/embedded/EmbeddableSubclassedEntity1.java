package io.mateu.showcase.tester.model.entities.embedded;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.Embeddable;

@Getter@Setter@ToString
@Embeddable
public class EmbeddableSubclassedEntity1 extends EmbeddableAbstractEntity {

    private int age;

}
