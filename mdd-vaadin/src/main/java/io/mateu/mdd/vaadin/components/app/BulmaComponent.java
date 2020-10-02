package io.mateu.mdd.vaadin.components.app;

import com.vaadin.ui.CustomLayout;

import java.io.IOException;

public class BulmaComponent extends CustomLayout {

    public BulmaComponent() throws IOException {
        super(BulmaComponent.class.getResourceAsStream("/html/index.html"));
    }

}
