package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.interfaces.ActionHandler;

public record CrudDeleteResultActionHandler(Crud crud) implements ActionHandler {

    @Override
    public Object handle(String actionId) {
        return crud;
    }
}
