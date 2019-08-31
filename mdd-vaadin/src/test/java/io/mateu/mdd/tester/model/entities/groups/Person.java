package io.mateu.mdd.tester.model.entities.groups;

import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.annotations.NoChart;
import io.mateu.mdd.core.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class Person {

    @Id@GeneratedValue
    private long id;

    private String name;

    @NoChart
    private Gender gender;

    @TextArea
    private String comments;

}
