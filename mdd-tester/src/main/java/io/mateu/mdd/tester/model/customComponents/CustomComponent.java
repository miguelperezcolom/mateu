package io.mateu.mdd.tester.model.customComponents;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;

public class CustomComponent extends VerticalLayout {

    public CustomComponent() {

        addComponent(new Label("This is a custome component"));

        addComponent(new Label("Here I can do whatever I want"));

        addComponentsAndExpand(new Label(""));

    }


    @Override
    public String toString() {
        return "Custom component sample";
    }
}
