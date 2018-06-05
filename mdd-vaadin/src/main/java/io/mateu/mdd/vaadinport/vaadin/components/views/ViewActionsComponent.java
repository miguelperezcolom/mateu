package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;

public class ViewActionsComponent extends HorizontalLayout implements Component {

    public ViewActionsComponent(AbstractViewComponent viewComponent) {


        build();
    }

    private void build() {

        addStyleName("viewactions");


    }
}
