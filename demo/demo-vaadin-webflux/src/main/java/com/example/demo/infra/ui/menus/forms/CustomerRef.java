package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.*;

public class CustomerRef {

    @CallActionOnChange("customer.onCodeChange")
    @FlexGrow("0")
            @ReplaceableCaption
    String code;

    @SameLine
    @ReadOnly
            @SuffixableCaption
    String nameOf;



    @Action(visible = false)
    void onCodeChange() {
        nameOf = "" + code + "xxxx";
    }

}
