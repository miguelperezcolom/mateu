package io.mateu.mdd.vaadin.navigation;

import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.util.notification.Notifier;

public class ControllerPathApplier {

    private final Controller controller;
    private final ViewStack stack;
    private String foundPath;
    private String remainingPath;

    public ControllerPathApplier(Controller controller, ViewStack stack, String foundPath, String remainingPath) {
        this.controller = controller;
        this.stack = stack;
        this.foundPath = foundPath;
        this.remainingPath = remainingPath;
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
            Object result = controller.apply(stack, foundPath, step, cleanStep, remainingPath);

        } catch (Throwable e) {
            Notifier.alert(e);
        }
    }

}
