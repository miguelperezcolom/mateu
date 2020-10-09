package io.mateu.mdd.vaadin.controllers;

import com.vaadin.ui.Component;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.views.BrokenLinkView;
import io.mateu.util.notification.Notifier;

public class Controller {

    public AbstractViewComponent apply(ViewStack stack, String path) throws Throwable {
        String step = "";
        String remaining = "";
        if (path == null) path = "";
        if (path.startsWith("/")) path = path.substring(1);

        if (!"".equals(path)) {
            String[] ts = path.split("/");
            path = "";
            step = ts[0];
            if (ts.length > 1) for (int i = 1; i < ts.length; i++) {
                if (!"".equals(remaining)) remaining += "/";
                remaining += ts[i];
            }
        }

        apply(stack, path, step, ViewStack.cleanState(step), remaining);

        return (AbstractViewComponent) stack.getLastNavigable().getViewComponent();
    }

    public Component register(ViewStack stack, String path, Component component) {
        // crear vista a partir del componente y meter en el stack
        View v;
        if (component != null) v = new View(stack, component);
        else v = new BrokenLinkView(stack);
        try {
            stack.push(path, v, this);
        } catch (Exception e) {
            Notifier.alert(e);
        }
        return component;
    }

    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
    }

    public void next(ViewStack stack, String path, String step, String remaining) throws Throwable {
        String p = path;
        String s = "";
        String r = "";
        if ("".equals(step)) {
            apply(stack, p, s, ViewStack.cleanState(s), r);
        } else {
            if (!"".equals(p) && !p.endsWith("/")) p += "/";
            p += step;
            if (remaining.contains("/")) {
                s = remaining.substring(0, remaining.indexOf("/"));
                if (remaining.length() > s.length() + 1) {
                    r = remaining.substring(s.length() + 1);
                }
            } else {
                s = remaining;
                r = "";
            }
        }
        apply(stack, p, s, ViewStack.cleanState(s), r);
    }
}
