package io.mateu.mdd.core.interfaces;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.util.runnable.RunnableThrowsThrowable;

import java.util.ArrayList;
import java.util.List;

public class Button {

    String caption;
    final RunnableThrowsThrowable runnable;
    VaadinIcons icon;
    List<String> styles = new ArrayList<>();


    public Button(String caption, RunnableThrowsThrowable runnable) {
        this(caption, null, runnable);
    }

    public Button(String caption, VaadinIcons icon, RunnableThrowsThrowable runnable) {
        this.caption = caption;
        this.runnable = runnable;
        this.icon = icon;
    }


    public String getCaption() {
        return caption;
    }

    public Button setCaption(String caption) {
        this.caption = caption;
        return this;
    }

    public RunnableThrowsThrowable getRunnable() {
        return runnable;
    }

    public VaadinIcons getIcon() {
        return icon;
    }

    public Button setIcon(VaadinIcons icon) {
        this.icon = icon;
        return this;
    }

    public List<String> getStyles() {
        return styles;
    }

    public Button setStyles(List<String> styles) {
        this.styles = styles;
        return this;
    }

    public Button addStyle(String style) {
        this.styles.add(style);
        return this;
    }

}
