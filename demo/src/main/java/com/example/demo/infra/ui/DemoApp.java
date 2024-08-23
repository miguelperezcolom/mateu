package com.example.demo.infra.ui;

import com.example.demo.infra.ui.menus.*;
import com.example.demo.infra.ui.menus.forms.BasicFieldsForm;
import io.mateu.core.domain.uidefinition.core.interfaces.ConsumesContextData;
import io.mateu.core.domain.uidefinition.core.interfaces.HasAppTitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasLogin;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Private;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.Map;

@Getter
@Slf4j
public class DemoApp implements HasLogin, HasAppTitle
// , IncludesRemoteUIs
{

  @Submenu private FormsSubmenu forms;

  @Submenu private CollectionsSubmenu collections;

  @Submenu private RefsSubmenu refs;

  @Submenu private CrudsSubmenu cruds;

  @Submenu private ActionsSubmenu actions;

  @Submenu private LayoutsSubmenu layouts;

  @Submenu private UtilSubmenu util;

  @Submenu private UseCasesSubmenu useCases;

  @MenuOption @Private private BasicFieldsForm eyesOnly;

  @Override
  public String getLoginUrl() {
    return "/login";
  }

  @Override
  public String getAppTitle() {
    return "Demo";
  }

}
