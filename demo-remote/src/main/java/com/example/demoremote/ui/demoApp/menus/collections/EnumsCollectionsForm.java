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
public class EnumsCollectionsForm {

    @Section("With enums")
    private Division[] enums = {Division.East, Division.South};

    private List<Division> enumsCollection = List.of(Division.South, Division.West);

    @Section("Assessment")
    @ReadOnly
    private String assessment;



    @Action
    public void assess() {
        assessment = ""
        + ", " + Arrays.toString(enums)
                + ", " + enumsCollection.toString()
        ;
    }

}
