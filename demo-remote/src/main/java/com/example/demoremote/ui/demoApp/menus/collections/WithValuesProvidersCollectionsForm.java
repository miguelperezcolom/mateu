package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.agnostic.providers.IntegersProvider;
import com.example.demoremote.domains.agnostic.providers.ColorsProvider;
import io.mateu.mdd.shared.annotations.*;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
@Caption("Arrays and collections")
public class WithValuesProvidersCollectionsForm {

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


                + ", " + Arrays.toString(chooseStrings)
                + ", " + chooseStringsForColection.toString()
                + ", " + Arrays.toString(chooseInts)
                + ", " + chooseIntsForColection.toString()

        ;
    }

}
