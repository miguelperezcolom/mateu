package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.*;

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
