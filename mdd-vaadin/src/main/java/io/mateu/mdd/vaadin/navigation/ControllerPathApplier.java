package io.mateu.mdd.vaadin.navigation;

import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.views.ViewMapper;
import io.mateu.util.notification.Notifier;

public class ControllerPathApplier {

    private Controller controller;
    private final ViewStack stack;
    private final ViewMapper viewMapper;
    private String foundPath;
    private String remainingPath;

    public ControllerPathApplier(Controller controller, ViewStack stack, String foundPath, String remainingPath) {
        this.controller = controller;
        this.stack = stack;
        this.foundPath = foundPath;
        this.remainingPath = remainingPath;
        this.viewMapper = new ViewMapper(stack);
    }

    public void apply() {
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
            View view = viewMapper.toView(model, step);
            foundPath = foundPath + "/" + step;
            registerViewInStack(foundPath, view);

            if (!remainingPath.isEmpty()) {
                // move forward to the next step
                controller = view.getController();
                apply();
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
