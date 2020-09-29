package io.mateu.mdd.vaadin.controllers;

import com.google.common.base.Strings;
import com.vaadin.ui.Component;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.navigation.ComponentWrapper;

public class Controller {

    public AbstractViewComponent apply(String path) throws Exception {
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


        AbstractViewComponent r = null;
        Component component = apply(path, step, remaining);
        if (component != null) {
            if (component instanceof AbstractViewComponent) r = (AbstractViewComponent) component;
            else r = new ComponentWrapper(component.toString(), component);
        }
        return r;
    }

    public Component apply(String path, String step, String remaining) throws Exception {
        return null;
    }

    protected Component next(String path, String step, String remaining) throws Exception {
        String p = path;
        String s = "";
        String r = "";
        if ("".equals(step)) {
            return apply(p, s, r);
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
        return apply(p, s, r);
    }
}
