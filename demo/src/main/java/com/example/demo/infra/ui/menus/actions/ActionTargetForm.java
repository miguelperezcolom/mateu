package com.example.demo.infra.ui.menus.actions;

import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionType;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import java.net.URL;

import static io.mateu.core.infra.Utils.exit;

@Service
@Getter
@Setter
@Caption("Action targets")
public class ActionTargetForm {

    String name = "Mateu";

    String run() {
        return "Hello " + name + "!";
    }

    @MainAction(type = ActionType.Secondary, order = 0)
    String here() {
        return run();
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

    @MainAction(target = ActionTarget.Left, type = ActionType.Secondary, order = 3)
    String left() {
        return run();
    }

    @MainAction(target = ActionTarget.Right, type = ActionType.Secondary, order = 3)
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
        exit(0);
        return new URL("https://www.google.es");
    }

}
