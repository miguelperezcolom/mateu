package io.mateu.mdd.core.app;

import com.vaadin.icons.VaadinIcons;

import java.util.concurrent.Callable;

public class ColumnAction implements Runnable {

    private final Runnable runnable;
    private final Callable<String> valueProvider;
    private final Callable<VaadinIcons> iconProvider;

    public ColumnAction(Runnable runnable, Callable<String> valueProvider, Callable<VaadinIcons> iconProvider) {
        this.runnable = runnable;
        this.valueProvider = valueProvider;
        this.iconProvider = iconProvider;
    }

    @Override
    public String toString() {
        try {
            return iconProvider != null? iconProvider.call().getHtml():valueProvider.call();
        } catch (Exception e) {
            return e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    @Override
    public void run() {
        runnable.run();
    }
}
