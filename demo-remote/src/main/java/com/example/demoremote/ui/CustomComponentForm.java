package com.example.demoremote.ui;


import com.example.demoremote.providers.PlayersProvider;
import com.example.demoremote.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.io.File;
import java.util.List;

@Data
@Caption("Custom components")
public class CustomComponentForm {

    @Section("Custom components")
    @CustomElement("my-custom-element")
    private String somethingCustom;

    @Section("Assessment")
    @ReadOnly
    private String assessment;



    @Action
    public void assess() {
        assessment = "" + somethingCustom
        ;
    }

}
