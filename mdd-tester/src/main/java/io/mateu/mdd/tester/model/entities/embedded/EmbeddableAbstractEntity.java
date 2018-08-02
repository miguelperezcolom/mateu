package io.mateu.mdd.tester.model.entities.embedded;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;

@Getter@Setter@ToString
@Embeddable
public class EmbeddableAbstractEntity {

    @NotNull
    private String name;

}
