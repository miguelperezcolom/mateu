package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.othercomponents.MyDiv;
import io.mateu.uidl.core.annotations.MenuOption;
import io.mateu.uidl.core.data.Destination;
import io.mateu.uidl.core.data.DestinationType;
import io.mateu.uidl.core.data.Result;
import io.mateu.uidl.core.data.ResultType;
import io.mateu.uidl.core.interfaces.*;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;

public class OtherComponentsSubmenu implements ActionHandler {

  @MenuOption private Card basicCard = new Card(
          "This is the header",
          "This is the subhead",
          "This is the supporting text"
  );

  @MenuOption private Card completeCard = new Card(
          CardLayout.Layout1,
          "Thumbnail",
          "This is the header",
          "This is the subhead",
          "/myassets/background.svg",
          "This is the supporting text",
          List.of(new Button("button1", "Button 1")
                  , new Button("button2", "Button 2")),
          List.of(new CallableIcon("icon1", Icon.Abacus, "This is icon 1"),
                  new CallableIcon("icon2", Icon.AcademyCap, "This is icon 2")),
          this

  );

  @MenuOption private Result result = new Result(
          "This is the result",
          ResultType.Success,
          "This is the message",
          List.of(
                  new Destination("yyy", DestinationType.View, "Go to yyy", null),
                  new Destination("zzz", DestinationType.View, "Go to zzz", null)
          ),
          new Destination("xxx", DestinationType.View, "Go to xxx", null),
          null,
          this
  );

  @MenuOption
  MyDiv element;

  @MenuOption
  FormsSubmenu directory;

    @MenuOption
    CrudsSubmenu anotherDirectory;

  @MenuOption
  JourneyStarter remote = new JourneyStarter(
          "com.example.demo.infra.ui.helloworld.HelloWorld",
          "",
          "/mateu/v3",
          "{\"nombre\":\"Mateu\",\"age\":16}"
  );

    @Override
    public Object handle(Object target, String actionId, ServerHttpRequest serverHttpRequest) {
        return switch (actionId) {
            case "button1" -> "Hello button 1!";
            case "button2" -> "Hello button 2!";
            case "icon1" -> "Hello icon 1!";
            case "icon2" -> "Hello icon 2!";
            case "xxx" -> "Hello xxx!";
            case "yyy" -> "Hello yyy!";
            case "zzz" -> "Hello zzz!";
            default -> throw new IllegalStateException("Unexpected value: " + actionId);
        };
    }
}
