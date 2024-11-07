package com.example.demo.infra.ui;

import com.example.demo.infra.ui.menus.*;
import com.example.demo.infra.ui.menus.forms.BasicFieldsForm;
import io.mateu.uidl.core.annotations.MenuOption;
import io.mateu.uidl.core.annotations.Private;
import io.mateu.uidl.core.annotations.Submenu;
import io.mateu.uidl.core.interfaces.App;
import io.mateu.uidl.core.interfaces.HasAppTitle;
import io.mateu.uidl.core.interfaces.HasApps;
import io.mateu.uidl.core.interfaces.HasLogin;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Getter
@Slf4j
public class DemoApp implements HasLogin, HasAppTitle, HasApps
// , IncludesRemoteUIs
{

  @Submenu
  private FormsSubmenu forms;

  @Submenu private CrudsSubmenu cruds;

  @Submenu private OtherComponentsSubmenu otherComponents;

  @Submenu private LayoutsSubmenu layouts;

  //@Submenu private UtilSubmenu util;

  //@Submenu private UseCasesSubmenu useCases;

  @MenuOption
  @Private
  private BasicFieldsForm eyesOnly;

  @Override
  public String getLoginUrl() {
    return "/secured";
  }

  @Override
  public String getAppTitle() {
    return "Demo";
  }

  @Override
  public List<App> getApps() {
    return List.of(
            new App("vaadin:invoice", "Invoicing", "", "", false),
            new App("vaadin:calendar-user", "HR", "", "", false),
            new App("vaadin:factory", "Factory", "", "", true),
            new App("vaadin:doctor", "Health", "", "/simpleform", false)
    );
  }
}
