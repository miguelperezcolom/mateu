package com.vaadin.navigator;

import com.vaadin.ui.UI;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.navigation.ViewStack;

import java.net.URI;

public class CustomPushStateManager extends Navigator.PushStateManager {
    private final UI ui;
    private final ViewStack stack;

    public CustomPushStateManager(UI ui, ViewStack stack) {
        super(ui);
        this.ui = ui;
        this.stack = stack;
    }

    @Override
    public void setState(String state) {
        StringBuilder sb = new StringBuilder(ui.getUiRootPath());
        if (!ui.getUiRootPath().endsWith("/")) {
            sb.append('/');
        }

        View firstEditor = null;
        for (int pos = 0; pos < stack.size() && firstEditor == null; pos++) {
            View v = stack.get(pos);
            if (v.getViewComponent() instanceof EditorViewComponent) firstEditor = v;
        }
        if (firstEditor != null) state = stack.getState(firstEditor);

        sb.append(state);
        URI location = ui.getPage().getLocation();
        if (location != null) {
            ui.getPage().pushState(location.resolve(sb.toString()));
        } else {
            throw new IllegalStateException("The Page of the UI does not have a location.");
        }
    }

}
