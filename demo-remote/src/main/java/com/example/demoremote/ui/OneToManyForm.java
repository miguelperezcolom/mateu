package com.example.demoremote.ui;

import com.example.demoremote.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
@Caption("One to many relationships")
public class OneToManyForm {

    @Section("External refs")
    @ItemsProvider(TeamsProvider.class)
    private ExternalReference[] array;

    @ItemsProvider(TeamsProvider.class)
    private List<ExternalReference> list;

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment =
                "" + Arrays.toString(array)
                        + ", " + list.toString()
        ;
    }

}
