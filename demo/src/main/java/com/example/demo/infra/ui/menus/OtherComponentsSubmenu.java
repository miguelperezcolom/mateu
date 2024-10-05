package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.othercomponents.MyDiv;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;

import java.util.List;

public class OtherComponentsSubmenu {

  @MenuOption private Card card = new Card(
          "This is the header",
          "This is the subhead",
          "This is the supporting text"
  );

  @MenuOption private Result result = new Result(
          ResultType.Success,
          "This is the message",
          List.of(),
          null,
          null
  );

  @MenuOption
  MyDiv element;

}
