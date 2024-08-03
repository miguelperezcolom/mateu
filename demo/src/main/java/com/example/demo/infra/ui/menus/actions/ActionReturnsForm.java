package com.example.demo.infra.ui.menus.actions;

import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionType;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import java.net.URL;

import static io.mateu.core.infra.Utils.exit;

@Service
@Getter
@Setter
@Caption("Action returns")
public class ActionReturnsForm {

    String name = "Mateu";

    String run() {
        return "Hello " + name + "!";
    }

    @SneakyThrows
    @MainAction(type = ActionType.Secondary, order = 3)
    URL url() {
        return new URL("https://www.google.es");
    }

    @SneakyThrows
    @MainAction(type = ActionType.Secondary, target = ActionTarget.NewTab, order = 4)
    URL urlInTab() {
        return new URL("https://www.google.es");
    }

    @SneakyThrows
    @MainAction(target = ActionTarget.NewWindow, order = 5)
    URL urlInWindow() {
        return new URL("https://www.google.es");
    }

}
