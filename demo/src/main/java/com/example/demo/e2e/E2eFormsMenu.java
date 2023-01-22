package com.example.demo.e2e;

import com.example.demo.e2e.documents.DocumentForm;
import com.example.demo.e2e.forms.*;
import io.mateu.mdd.shared.annotations.MenuOption;

public class E2eFormsMenu {

    @MenuOption
    private BasicForm basicForm;

    @MenuOption
    private StringArrayFieldForm stringArrayFieldForm;

    @MenuOption
    private IntArrayFieldForm intArrayFieldForm;

    @MenuOption
    private BooleanArrayFieldForm booleanArrayFieldForm;

    @MenuOption
    private PojoFieldForm pojoFieldForm;

    @MenuOption
    private CollectionFieldForm collectionFieldForm;

    @MenuOption
    private MapFieldForm mapFieldForm;

    @MenuOption
    private MapStringToPojoFieldForm mapToPojoFieldForm;

    @MenuOption
    private MapPojoToStringFieldForm mapPojoToStringFieldForm;

    @MenuOption
    private CollectionOfPojoWithConstructorFieldForm collectionOfPojoWithConstructorFieldForm;

    @MenuOption
    private RunnableForm runnableForm;

    @MenuOption
    private CallableForm callableForm;

    @MenuOption
    private CallableFieldForm callableFieldForm;

    @MenuOption
    private RunnableFieldForm runnableFieldForm;

    @MenuOption
    private ButtonFieldForm buttonFieldForm;

    @MenuOption
    private UrlFieldForm urlFieldForm;

    @MenuOption
    private TextAreaFieldForm textAreaFieldForm;

    @MenuOption
    private DocumentForm documentForm;
}
