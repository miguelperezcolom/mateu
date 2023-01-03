package com.example.demo.e2e;

import com.example.demo.e2e.cruds.basic.BasicCrud;
import com.example.demo.e2e.cruds.notSoBasic.NotSoBasicCrud;
import com.example.demo.e2e.forms.BasicForm;
import com.example.demo.e2e.forms.CollectionFieldForm;
import com.example.demo.e2e.forms.PojoFieldForm;
import io.mateu.mdd.shared.annotations.MenuOption;

public class E2eMenu {

    @MenuOption
    private BasicForm basicForm;

    @MenuOption
    private PojoFieldForm pojoFieldForm;

    @MenuOption
    private CollectionFieldForm collectionFieldForm;

    @MenuOption
    private BasicCrud basicCrud;

    @MenuOption
    private NotSoBasicCrud notSoBasicCrud;
}
