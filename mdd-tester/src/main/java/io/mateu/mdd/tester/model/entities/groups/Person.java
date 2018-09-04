package io.mateu.mdd.tester.model.entities.groups;

import io.mateu.mdd.core.annotations.MainSearchFilter;
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

    @MainSearchFilter
    private String name;

    private Gender gender;

}
