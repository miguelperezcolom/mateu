package io.mateu.mdd.vaadin.controllers;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewProvider;
import io.mateu.mdd.vaadin.navigation.ViewStack;

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

        return controller.apply(s);
    }

    public ViewStack getStack() {
        return stack;
    }
}
