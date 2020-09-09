package io.mateu.showcase.tester.model.entities.subclassed;

import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class Superclass {

    @Id
    @GeneratedValue
    private long id;


    private String name;

}
