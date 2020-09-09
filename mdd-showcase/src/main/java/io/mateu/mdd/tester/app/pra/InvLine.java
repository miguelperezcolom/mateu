package io.mateu.mdd.tester.app.pra;

import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;

@MateuMDDEntity
public class InvLine {

    @ManyToOne
    private Article article;

    private int units;

    private double total;

}


