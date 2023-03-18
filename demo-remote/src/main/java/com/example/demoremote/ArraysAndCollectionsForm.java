package com.example.demoremote;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
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

    @Section("With enums")
    private Division[] enums;

    private List<Division> enumsCollection;

    @Section("With external refs")
    @ItemsProvider(TeamsProvider.class)
    private ExternalReference[] teams;

    @ItemsProvider(TeamsProvider.class)
    private List<ExternalReference> temasCollection;

    @Section("With value providers")
    @ValuesProvider(ColorsProvider.class)
    private String[] chooseStrings;

    @ValuesProvider(ColorsProvider.class)
    private List<String> chooseStringsForColection;

    @ValuesProvider(IntegersProvider.class)
    private int[] chooseInts;

    @ValuesProvider(IntegersProvider.class)
    private List<Integer> chooseIntsForColection;

    @Section("Assessment")
    @ReadOnly
    private String assessment;



    @Action
    public void assess() {
        assessment = "" + booleans;
        ;
    }

}
