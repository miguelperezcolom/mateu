package io.mateu.mdd.vaadin.controllers;

import com.vaadin.ui.Component;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.views.BrokenLinkView;
import io.mateu.util.notification.Notifier;

public abstract class Controller {

    public abstract Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable;

    public void registerComponentInStack(ViewStack stack, String path, Component component) {
        // crear vista a partir del componente y meter en el stack
        View v;
        if (component != null) v = new View(stack, component);
        else v = new BrokenLinkView(stack);
        try {
            stack.push(path, v, this);
        } catch (Exception e) {
            Notifier.alert(e);
        }
    }


}
