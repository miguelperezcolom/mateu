package io.mateu.mdd.vaadin.navigation;

import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenHtmlAction;
import io.mateu.mdd.core.app.MDDOpenUrlAction;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.secondLevel.EditorController;
import io.mateu.mdd.vaadin.views.ObjectToViewMapper;
import io.mateu.util.notification.Notifier;

public class ControllerPathApplier {

    private Controller controller;
    private final ViewStack stack;
    private final ObjectToViewMapper viewMapper;
    private String foundPath;
    private String remainingPath;

    public ControllerPathApplier(Controller controller, ViewStack stack, String foundPath, String remainingPath) {
        this.controller = controller;
        this.stack = stack;
        this.foundPath = foundPath;
        this.remainingPath = remainingPath;
        this.viewMapper = new ObjectToViewMapper(stack);
    }

    public void apply() {
        if ("/".equals(remainingPath) && controller instanceof EditorController) return;
        try {
            if (foundPath.startsWith("/")) foundPath = foundPath.substring(1);
            if (remainingPath.startsWith("/")) remainingPath = remainingPath.substring(1);
            String step = remainingPath;
            remainingPath = "";
            if (step.contains("/")) {
                remainingPath = step.substring(step.indexOf("/") + 1);
                step = step.substring(0, step.indexOf("/"));
            }
            String cleanStep = ViewStack.cleanState(step);
            Object model = controller.apply(stack, foundPath, step, cleanStep, remainingPath);

            //todo: revisar esto
            if (model != null && model instanceof MDDOpenUrlAction) {
                new AcctionRunner().run((MDDOpenUrlAction) model);
            } else {
                View view = viewMapper.toView(model, step);
                foundPath = foundPath + "/" + step;
                registerViewInStack(foundPath, view);

                if (!remainingPath.isEmpty()) {
                    // move forward to the next step
                    controller = view.getController();
                    apply();
                }
            }

        } catch (Throwable e) {
            Notifier.alert(e);
        }
    }

    public void registerViewInStack(String path, View view) {
        // meter la vista en el stack
        try {
            stack.push(path, view);
        } catch (Exception e) {
            Notifier.alert(e);
        }
    }

}
