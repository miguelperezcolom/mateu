package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.vaadinport.vaadin.components.views.ViewComponent;

public class CenterComponent extends VerticalLayout {


    public CenterComponent() {
        addStyleName("viewcontainer");
    }

    public void open(ViewComponent viewComponent) {
        removeAllComponents();
        addComponentsAndExpand(viewComponent);
    }
}
