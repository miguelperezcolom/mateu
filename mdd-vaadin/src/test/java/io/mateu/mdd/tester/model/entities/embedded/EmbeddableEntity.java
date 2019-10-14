package io.mateu.mdd.tester.model.entities.embedded;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;

@Getter@Setter@ToString
@Embeddable
public class EmbeddableEntity {

    @NotNull
    private String name;

    private int age;

}
