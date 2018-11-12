package io.mateu.mdd.tester.model.entities.subclassed;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class Superclass {

    @Id
    @GeneratedValue
    private long id;


    private String name;

}
