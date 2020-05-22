package io.mateu.mdd.tester.app.pra;

import lombok.MateuMDDEntity;

import javax.persistence.OneToMany;
import java.util.List;

@MateuMDDEntity
public class Inv {

    private String number;

    @OneToMany
    private List<InvLine> lines;

    private double total;

}



