package com.example.demo.e2e;

import com.example.demo.e2e.forms.*;
import io.mateu.mdd.shared.annotations.MenuOption;

public class E2eFormsMenu {

    @MenuOption
    private BasicForm basicForm;

    @MenuOption
    private PojoFieldForm pojoFieldForm;

    @MenuOption
    private CollectionFieldForm collectionFieldForm;

    @MenuOption
    private CollectionOfPojoWithConstructorFieldForm collectionOfPojoWithConstructorFieldForm;

    @MenuOption
    private RunnableForm runnableForm;

    @MenuOption
    private CallableForm callableForm;

}
