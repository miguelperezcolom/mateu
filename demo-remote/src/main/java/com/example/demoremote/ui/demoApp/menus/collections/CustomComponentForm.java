package com.example.demoremote.ui.demoApp.menus.collections;


import io.mateu.mdd.shared.annotations.*;
import lombok.Data;

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
