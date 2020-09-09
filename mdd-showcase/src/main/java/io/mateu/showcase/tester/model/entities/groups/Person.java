package io.mateu.showcase.tester.model.entities.groups;

import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.annotations.NoChart;
import io.mateu.mdd.core.annotations.TextArea;

import javax.persistence.CascadeType;
import javax.persistence.GeneratedValue;

import io.mateu.mdd.core.model.multilanguage.Literal;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@MateuMDDEntity
public class Person {

    @Id@GeneratedValue
    private long id;

    @MainSearchFilter
    private String name;

    @NoChart
    @MainSearchFilter
    private Gender gender;

    @ManyToOne(cascade = CascadeType.ALL)
    @MainSearchFilter
    private Literal profile = new Literal();

    @TextArea
    private String comments;

}
