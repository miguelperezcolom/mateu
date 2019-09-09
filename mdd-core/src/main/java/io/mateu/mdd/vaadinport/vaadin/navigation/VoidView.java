package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.ui.Component;
import com.vaadin.ui.Label;

public class VoidView extends View {


    public VoidView(ViewStack stack) {
        super(stack, new Label());
    }
}
