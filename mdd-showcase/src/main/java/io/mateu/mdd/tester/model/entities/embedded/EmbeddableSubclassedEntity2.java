package io.mateu.mdd.tester.model.entities.embedded;

import io.mateu.mdd.core.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.Embeddable;

@Getter@Setter@ToString
@Embeddable
public class EmbeddableSubclassedEntity2 extends EmbeddableAbstractEntity {

    @TextArea
    private String comments;

}
