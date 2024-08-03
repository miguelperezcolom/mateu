package com.example.demo.infra.ui;

import com.example.demo.infra.ui.menus.*;
import com.example.demo.infra.ui.menus.forms.BasicFieldsForm;
import io.mateu.core.domain.uidefinition.core.interfaces.HasAppTitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasLogin;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Private;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import lombok.Getter;

@Getter
public class DemoApp implements HasLogin, HasAppTitle
// , IncludesRemoteUIs
{

  @Submenu private FormsSubmenu forms;

  @Submenu private CollectionsSubmenu collections;

  @Submenu private RefsSubmenu refs;

  @Submenu private CrudsSubmenu cruds;

  @Submenu private ActionsSubmenu actions;

  @Submenu private UtilSubmenu util;

  @Submenu private UseCasesSubmenu useCases;

  @MenuOption @Private private BasicFieldsForm eyesOnly;

  /*
  @Submenu
  private RemoteSubmenu remote = new RemoteSubmenu("https://demo.mateu.io/mateu/v1", "com.example.demo.DemoApp", "Simple menu");


  @Override
  public List<RemoteUI> getRemoteUIs() {
      return List.of(new RemoteUI("https://demo.mateu.io/mateu/v1", "com.example.demo.DemoApp"));
  }

  */

  @Override
  public String getLoginUrl() {
    return "/login";
  }

  @Override
  public String getAppTitle() {
    return "Demo";
  }
}
