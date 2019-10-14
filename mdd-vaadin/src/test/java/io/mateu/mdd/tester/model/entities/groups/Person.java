package io.mateu.mdd.tester.model.entities.groups;

import io.mateu.mdd.core.annotations.NoChart;
import io.mateu.mdd.core.annotations.TextArea;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class Person {

    @Id@GeneratedValue
    private long id;

    private String name;

    @NoChart
    private Gender gender;

    @TextArea
    private String comments;

}
