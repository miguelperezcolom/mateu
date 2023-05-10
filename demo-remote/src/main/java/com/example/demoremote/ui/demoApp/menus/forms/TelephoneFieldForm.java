package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.TelephoneNumber;
import lombok.Data;

@Data@Caption("Telephone field with prefix")
public class TelephoneFieldForm {

    @Section("Telephones")
    private TelephoneNumber home;

    private TelephoneNumber work = TelephoneNumber.builder()
            .prefix("+34")
            .number("971123456")
            .build();


    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = "" + home
                + ", " + work
        ;
    }

}
