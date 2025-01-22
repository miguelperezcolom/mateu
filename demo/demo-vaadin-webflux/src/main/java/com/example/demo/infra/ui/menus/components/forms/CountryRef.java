package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.*;

public class CountryRef {

        @CallActionOnChange("country.onCodeChange")
        @FlexGrow("0")
                @SuffixableCaption
        String codeOf;

        @SameLine
        @ReadOnly
                @PrefixableCaption
        String name;


        @Action(visible = false)
        void onCodeChange() {
                name = "" + codeOf + "zzzz";
        }

}
