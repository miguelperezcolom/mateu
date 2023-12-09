package com.example.demoremote.ui.demoApp;

import com.example.demoremote.ui.demoApp.menus.*;
import com.example.demoremote.ui.demoApp.menus.forms.BasicFieldsForm;
import io.mateu.mdd.core.interfaces.HasAppTitle;
import io.mateu.mdd.core.interfaces.HasLogin;
import io.mateu.mdd.shared.annotations.*;
import lombok.Getter;

@Getter
public class DemoApp implements HasLogin, HasAppTitle
// , IncludesRemoteUIs
{

  @Submenu private FormsSubmenu forms;

  @Submenu private CollectionsSubmenu collections;

  @Submenu private RefsSubmenu refs;

  private CrudsSubmenu cruds;

  @Submenu private BrokenSubmenu broken;

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
