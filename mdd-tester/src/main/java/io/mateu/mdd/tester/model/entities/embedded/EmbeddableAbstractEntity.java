package io.mateu.mdd.tester.model.entities.embedded;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.eclipse.persistence.annotations.Customizer;

import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;

@Getter@Setter@ToString
@Embeddable
@Customizer(EmbeddableCustomizer.class)
public class EmbeddableAbstractEntity {

    @NotNull
    private String name;

}
