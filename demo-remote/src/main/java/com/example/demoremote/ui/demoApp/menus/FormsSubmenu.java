package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.collections.*;
import com.example.demoremote.ui.demoApp.menus.forms.*;
import com.example.demoremote.ui.demoApp.menus.refs.ExternalRefsAndFilesForm;
import io.mateu.mdd.shared.annotations.MenuOption;
import lombok.Data;


public class FormsSubmenu {


    @MenuOption
    private MyReadOnlyPojo readOnlyPojo;

    @MenuOption
    private MyReadOnlyPojoWithCrud readOnlyPojoWithCrud;

    @MenuOption
    private ReturnsResult returnsResult;

    @MenuOption
    private UrlAndTextForm urlAndText;

    @MenuOption
    private HideFieldForm hideField;

    @MenuOption
    private SameLineForm sameLine;

    @MenuOption
    private ActionsWithParametersForm actionsWithParameters;

    @MenuOption
    private WebComponentForm webComponent;

}
