package io.mateu.showcase.tester.model.entities.specialFields;

import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.model.multilanguage.Literal;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@MateuMDDEntity
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
