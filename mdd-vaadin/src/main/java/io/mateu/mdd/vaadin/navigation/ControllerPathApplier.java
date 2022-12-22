package io.mateu.mdd.vaadin.navigation;

import com.vaadin.ui.Component;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.views.BrokenLinkView;
import io.mateu.mdd.vaadin.views.ViewMapper;
import io.mateu.util.notification.Notifier;

public class ControllerPathApplier {

    private final Controller controller;
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
            View view = viewMapper.toView(model);
            regis

        } catch (Throwable e) {
            Notifier.alert(e);
        }
    }

    public void registerComponentInStack(ViewStack stack, String path, Component component) {
        // crear vista a partir del componente y meter en el stack
        View v;
        if (component != null) v = new View(stack, component);
        else v = new BrokenLinkView(stack);
        try {
            stack.push(path, v);
        } catch (Exception e) {
            Notifier.alert(e);
        }
    }

}
