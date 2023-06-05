package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.forms.*;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.RemoteJourney;


public class FormsSubmenu {

    @MenuOption
    private TextFieldsForm text;

    @MenuOption
    private ChecksFieldsForm checks;

    @MenuOption
    private DatesFieldsForm dates;

    @MenuOption
    private TelephoneFieldForm telephone;

    @MenuOption
    private EnumFieldsForm enums;

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
    private DisableFieldForm disableField;

    @MenuOption
    private CallActionOnChangeFieldForm callActionOnChange;

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
    private RemoteJourney remoteForm = new RemoteJourney("https://explorer.mateu.io/mateu/v1", "forms_returnsBasic");

}
