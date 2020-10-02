package io.mateu.mdd.vaadin.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;

import java.io.PrintWriter;
import java.io.StringWriter;

public class ProblemView extends View {

    private String title = "Problem";

    @Override
    public String toString() {
        return title;
    }

    public ProblemView(ViewStack stack, String title, String text) {
        super(stack, getContent(title, text));
        this.title = title;
    }

    public ProblemView(ViewStack stack, String title, Throwable throwable) {
        super(stack, getContent(title, throwable));
        this.title = title;
    }

    private static Component getContent(String title, String text) {
        Label h = new Label("Oops! it seems we have a problem.");
        h.addStyleName(ValoTheme.LABEL_H1);
        Label t = new Label(text, ContentMode.HTML);
        VerticalLayout vl = new VerticalLayout(h, t);
        vl.setSizeUndefined();
        return new ComponentWrapper(VaadinIcons.BUG, title, vl, false);
    }

    private static Component getContent(String title, Throwable throwable) {
        throwable.printStackTrace();
        Label h = new Label("Oops! it seems we have a problem.");
        h.addStyleName(ValoTheme.LABEL_H1);
        StringWriter sw = new StringWriter();
        throwable.printStackTrace(new PrintWriter(sw));
        Label t = new Label(sw.toString(), ContentMode.HTML);
        VerticalLayout vl = new VerticalLayout(h, t);
        vl.setSizeUndefined();
        return new ComponentWrapper(VaadinIcons.BUG, title, vl, false);
    }

}
