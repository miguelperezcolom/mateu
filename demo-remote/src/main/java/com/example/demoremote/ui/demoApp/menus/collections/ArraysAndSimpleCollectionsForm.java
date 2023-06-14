package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.nfl.dtos.Division;
import com.example.demoremote.domains.agnostic.providers.IntegersProvider;
import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import com.example.demoremote.domains.agnostic.providers.ColorsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
@Caption("Arrays and collections")
public class ArraysAndSimpleCollectionsForm {


    @Section("Arrays")
    private boolean[] booleans = {false, false, true, false};

    private int[] ints = {1,2,3,5};

    private double[] doubles = {1.2, 3.4, 5.1};

    private String[] strings = {"Mateu", "Antònia", "Miguel"};

    @Section("Collections")
    private List<Boolean> booleansCollection = List.of(false, false, true, false);

    private List<Integer> intsCollection = List.of(1, 2, 3, 6);

    private List<Double> doublesCollection = List.of(10.2, 3.1, 8.21);

    private List<String> stringsCollection = List.of("Mateu", "Antonia", "Miguel");

    @Section("With enums")
    private Division[] enums = {Division.East, Division.South};

    private List<Division> enumsCollection = List.of(Division.South, Division.West);

    @Section("With external refs")
    @ItemsProvider(TeamsProvider.class)
    private ExternalReference[] teams = {
            new ExternalReference("1", "Las Vegas Raiders")
            , new ExternalReference("5", "Seattle Seahawks")
    };

    @ItemsProvider(TeamsProvider.class)
    private List<ExternalReference> teamsCollection = List.of(
            new ExternalReference("1", "Las Vegas Raiders")
            , new ExternalReference("5", "Seattle Seahawks")
    );

    @Section("With value providers")
    @ValuesProvider(ColorsProvider.class)
    private String[] chooseStrings = {"Red", "Blue"};

    @ValuesProvider(ColorsProvider.class)
    private List<String> chooseStringsForColection = List.of("Yellow", "Blue");

    @ValuesProvider(IntegersProvider.class)
    private int[] chooseInts = {3, 7};

    @ValuesProvider(IntegersProvider.class)
    private List<Integer> chooseIntsForColection = List.of(1,7);

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

        + ", " + Arrays.toString(enums)
                + ", " + enumsCollection.toString()

                + ", " + Arrays.toString(teams)
                + ", " + teamsCollection.toString()

                + ", " + Arrays.toString(chooseStrings)
                + ", " + chooseStringsForColection.toString()
                + ", " + Arrays.toString(chooseInts)
                + ", " + chooseIntsForColection.toString()

        ;
    }

}
