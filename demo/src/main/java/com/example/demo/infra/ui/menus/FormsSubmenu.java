package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter;

public class FormsSubmenu {

  @MenuOption
  BasicFieldsForm basicFields;
  @MenuOption private TextFieldsForm text;

  /*
  <journey-starter
  uiid="com.example.mateuarticle1.ui.HelloWorld"
  journeytypeid="crud"
  baseurl="/mateu/v3"
  instant="IE5ctOHMfClup44NcP-Bp"
  contextdata=""></journey-starter>
   */

  @MenuOption private JourneyStarter remoteForm = new JourneyStarter(
          "com.example.mateuarticle1.ui.HelloWorld",
          "crud",
          "http://localhost:8080/mateu/v3",
          ""
  );

  @MenuOption private AutoReloadForm autoReload;

  @MenuOption private FormWithCallbacks formWithCallbacks;

  @MenuOption private BackgroundOnTop backgroundOnTop;

  @MenuOption private TabsForm tabs;

  @MenuOption private HasInitMethodForm hasInitMethod;
  @MenuOption private MessagesForm messages;

  @MenuOption private ModalsForm modals;

  //@MenuOption private RichTextFieldForm richText;

  @MenuOption private VaadinRichTextFieldForm richTextUsingVaadin;

  @MenuOption private NumberFieldsForm numbers;

  @MenuOption private BooleanFieldsForm checks;

  @MenuOption private DatesFieldsForm dates;

  @MenuOption private PatternValidatedFieldForm pattern;

  @MenuOption private TelephoneFieldForm telephone;

  @MenuOption private EnumFieldsForm enums;

  @MenuOption private NestedDropdownsForm nestedDropdowns;

  @MenuOption private MyReadOnlyPojo readOnlyPojo;

  @MenuOption private MyReadOnlyPojoWithCrud readOnlyPojoWithCrud;

  @MenuOption private WrappersFieldsForm wrappersFieldsForm;

  @MenuOption private ReturnsBasic returnsBasic;

  @MenuOption private ReturnsResult returnsResult;

  @MenuOption private UrlAndTextForm urlAndText;

  @MenuOption private HideFieldForm hideField;

  @MenuOption private HideActionForm hideAction;

  @MenuOption private DisableFieldForm disableField;

  @MenuOption private DisableActionForm disableAction;

  @MenuOption private CallActionOnChangeFieldForm callActionOnChange;

  @MenuOption private CallActionOnChecksForm callActionOnCheck;

  @MenuOption private CallActionOnFileUploadForm callActionOnFileUpload;

  @MenuOption private SameLineForm sameLine;

  @MenuOption private ActionsWithParametersForm actionsWithParameters;

  @MenuOption private MiscellaneousForm miscellaneous;

  @MenuOption private WizardPage1 wizard;

  @MenuOption private WebComponentForm webComponent;
}
