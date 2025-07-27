package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.othercomponents.MyDiv;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.Submenu;
import io.mateu.uidl.data.Destination;
import io.mateu.uidl.data.DestinationType;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.*;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;

public class ComponentsSubmenu {

    @Submenu
    private FormsSubmenu forms;

    @Submenu private CrudsSubmenu cruds;

    @Submenu private CardsSubmenu cards;

    @Submenu private ResultsSubmenu results;

  @MenuOption
  MyDiv element;

    @Submenu private DirectorySubmenu directories;

  @MenuOption
  MicroFrontend remote = new MicroFrontend(
          "",
          "{\"nombre\":\"Mateu\",\"age\":16}"
  );

  @MenuOption
  RequestTooLong requestTooLong;

}
