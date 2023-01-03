package com.example.demo.e2e;

import com.example.demo.e2e.cruds.basic.BasicCrud;
import com.example.demo.e2e.cruds.notSoBasic.NotSoBasicCrud;
import io.mateu.mdd.shared.annotations.MenuOption;

public class E2eCrudsMenu {

    @MenuOption
    private BasicCrud basicCrud;

    @MenuOption
    private NotSoBasicCrud notSoBasicCrud;

}
