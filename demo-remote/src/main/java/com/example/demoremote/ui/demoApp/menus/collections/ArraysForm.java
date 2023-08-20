package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.agnostic.providers.ColorsProvider;
import com.example.demoremote.domains.agnostic.providers.IntegersProvider;
import com.example.demoremote.domains.nfl.dtos.Division;
import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
@Caption("Arrays and collections")
public class ArraysForm {


    @Section("Arrays")
    private boolean[] booleans = {false, false, true, false};

    private int[] ints = {1,2,3,5};

    private double[] doubles = {1.2, 3.4, 5.1};

    private String[] strings = {"Mateu", "Antònia", "Miguel"};

    @Section("Assessment")
    @ReadOnly
    private String assessment;



    @Action
    public void assess() {
        assessment = ""
                + Arrays.toString(booleans)
        + "," + Arrays.toString(ints)
                + "," + Arrays.toString(doubles)
                + "," + Arrays.toString(strings)

                + Arrays.toString(booleans)
        + "," + Arrays.toString(ints)
                + "," + Arrays.toString(doubles)
                + "," + Arrays.toString(strings)
        ;
    }

}
