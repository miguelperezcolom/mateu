package io.mateu.mdd.tester.model.useCases.hotel;

import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne@NotNull
    private Hotel hotel;

    private String name;


    @Override
    public String toString() {
        return name != null?name:"Board " + id;
    }

}
