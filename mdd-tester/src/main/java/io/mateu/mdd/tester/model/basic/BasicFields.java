package io.mateu.mdd.tester.model.basic;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class BasicFields {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private String stringField;

    private int intField;

    private long longField;

    private double doubleField;

    private boolean booleanField;



}
