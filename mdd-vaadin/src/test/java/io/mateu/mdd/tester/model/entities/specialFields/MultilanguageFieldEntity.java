package io.mateu.mdd.tester.model.entities.specialFields;

import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.model.multilanguage.Literal;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
@Getter@Setter
public class MultilanguageFieldEntity {

    @Id@GeneratedValue
    private long id;

    private String name;

    @ManyToOne
    private Literal normal;


    @ManyToOne
    @TextArea
    private Literal big;

}
