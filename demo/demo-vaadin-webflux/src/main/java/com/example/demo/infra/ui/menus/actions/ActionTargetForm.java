package com.example.demo.infra.ui.menus.actions;

import io.mateu.uidl.annotations.*;
import lombok.Getter;
import lombok.Setter;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import java.net.URL;

@Service
@Getter
@Setter
@Title("Action targets")
public class ActionTargetForm {

    String name = "Mateu";

    String run() {
        return "Hello " + name + "!";
    }

    @SneakyThrows
    @MainAction(type = ActionType.Secondary, order = 0)
    URL here() {
        return new URL("https://www.google.es");
    }

    @MainAction(target = ActionTarget.Message, type = ActionType.Secondary, order = 1)
    String message() {
        return run();
    }

    @MainAction(target = ActionTarget.NewJourney, type = ActionType.Secondary, order = 2)
    String newJourney() {
        return run();
    }

    @MainAction(target = ActionTarget.NewModal, type = ActionType.Secondary, order = 3)
    String modal() {
        return run();
    }

    @MainAction(target = ActionTarget.LeftDrawer, type = ActionType.Secondary, order = 3)
    String left() {
        return run();
    }

    @MainAction(target = ActionTarget.RightDrawer, type = ActionType.Secondary, order = 3)
    String right() {
        return run();
    }


    @SneakyThrows
    @MainAction(type = ActionType.Secondary, target = ActionTarget.NewTab, order = 4)
    URL tab() {
        return new URL("https://www.google.es");
    }

    @SneakyThrows
    @MainAction(target = ActionTarget.NewWindow, order = 5)
    URL window() {
        return new URL("https://www.google.es");
    }

}
