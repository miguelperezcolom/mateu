package io.mateu.mdd.vaadin.controllers;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewProvider;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.navigation.BrokenLinkView;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.util.notification.Notifier;

public class MateuViewProvider implements ViewProvider {
    private final ViewStack stack;

    public MateuViewProvider(ViewStack stack) {
        this.stack = stack;
    }

    @Override
    public String getViewName(String s) {
        return s;
    }

    @Override
    public View getView(String s) {

        if (!s.startsWith("/")) s = "/" + s;

        Controller controller = new HomeController();

        //mirar si ya lo tenemos en el stack
        io.mateu.mdd.vaadin.navigation.View v = null;

        //clearStack();

        if (v == null) {
            AbstractViewComponent component = null;
            try {
                component = controller.apply(s);
            } catch (Exception e) {
                Notifier.alert(e);
            }
            // crear vista a partir del componente y meter en el stack
            if (component != null) v = new io.mateu.mdd.vaadin.navigation.View(stack, component);
            else v = new BrokenLinkView(stack);
            try {
                stack.push(s, v);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }

        return v;
    }

    public ViewStack getStack() {
        return stack;
    }
}
