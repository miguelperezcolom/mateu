package com.example.demo.infra.ui.menus;

import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.Button;
import io.mateu.uidl.interfaces.CallableIcon;
import io.mateu.uidl.interfaces.Card;
import io.mateu.uidl.interfaces.CardLayout;
import io.mateu.uidl.interfaces.Icon;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;

public class CardsSubmenu implements ActionHandler {

    @MenuOption
    private Card basicCard = new Card(
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
