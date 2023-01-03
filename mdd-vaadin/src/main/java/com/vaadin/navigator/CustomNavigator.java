package com.vaadin.navigator;

import com.vaadin.ui.ComponentContainer;
import com.vaadin.ui.UI;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class CustomNavigator extends Navigator {


    public CustomNavigator(UI ui, ComponentContainer container, ViewStack stack) {
        super(ui, new CustomPushStateManager(ui, stack), (ViewDisplay)(new Navigator.ComponentContainerViewDisplay(container)));
    }
}
