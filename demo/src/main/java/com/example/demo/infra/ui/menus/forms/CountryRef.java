package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.*;

public class CountryRef {

        @CallActionOnChange("country.onCodeChange")
        @FlexGrow("0")
        String code;

        @SameLine
        @ReadOnly
        String name;


        @Action(visible = false)
        void onCodeChange() {
                name = "" + code + "zzzz";
        }

}
