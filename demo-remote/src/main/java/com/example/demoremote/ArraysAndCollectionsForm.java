package com.example.demoremote;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.Section;
import lombok.Data;

import java.util.List;

@Data
@Caption("Arrays and collections")
public class ArraysAndCollectionsForm {

    @Section("Arrays")
    private boolean[] booleans;

    private int[] ints;

    private double[] doubles;

    private String[] strings;

    @Section("Collections")
    private List<Boolean> booleansCollection;

    private List<Integer> intsCollection;

    private List<Double> doublesCollection;

    private List<String> stringsCollection;


    @Section("Assessment")
    @ReadOnly
    private String assessment;



    @Action
    public void assess() {
        assessment = "" + booleans;
        ;
    }

}
