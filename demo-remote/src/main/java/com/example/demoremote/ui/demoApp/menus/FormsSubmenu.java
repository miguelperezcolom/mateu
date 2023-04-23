package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.forms.*;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.RemoteJourney;


public class FormsSubmenu {


    @MenuOption
    private MyReadOnlyPojo readOnlyPojo;

    @MenuOption
    private MyReadOnlyPojoWithCrud readOnlyPojoWithCrud;

    @MenuOption
    private WrappersFieldsForm wrappersFieldsForm;

    @MenuOption
    private ReturnsBasic returnsBasic;

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
    private MiscellaneousForm miscellaneous;

    @MenuOption
    private WizardPage1 wizard;

    @MenuOption
    private WebComponentForm webComponent;

    @MenuOption
    private RemoteJourney remoteForm = new RemoteJourney("https://demo.mateu.io/mateu/v1", "aSimpleForm");

}
