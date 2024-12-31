package com.example.demo.infra.ui;

import com.example.demo.infra.ui.menus.CrudsSubmenu;
import com.example.demo.infra.ui.menus.FormsSubmenu;
import com.example.demo.infra.ui.menus.LayoutsSubmenu;
import com.example.demo.infra.ui.menus.OtherComponentsSubmenu;
import com.example.demo.infra.ui.menus.forms.BasicFieldsForm;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.Private;
import io.mateu.uidl.annotations.Submenu;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HasAppTitle;
import io.mateu.uidl.interfaces.HasApps;
import io.mateu.uidl.interfaces.HasIcon;
import io.mateu.uidl.interfaces.HasLogin;
import io.mateu.uidl.interfaces.Icon;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Getter
@Slf4j
public class DemoApp implements HasLogin, HasAppTitle, HasIcon, HasApps
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

  @Submenu
  private RemotesSubmenu remotes;

  @Override
  public String getLoginUrl() {
    return "/secured";
  }

  @Override
  public String getAppTitle() {
    return "Demo app";
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

  @Override
  public String getIcon() {
    return Icon.Home.iconName;
  }
}
