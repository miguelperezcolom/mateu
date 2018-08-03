package io.mateu.mdd.tester.model.entities.embedded;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.eclipse.persistence.annotations.Customizer;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.validation.constraints.NotNull;

@Getter@Setter@ToString
@Embeddable
public class EmbeddableEntity {

    @NotNull
    private String name;

    private int age;

}
