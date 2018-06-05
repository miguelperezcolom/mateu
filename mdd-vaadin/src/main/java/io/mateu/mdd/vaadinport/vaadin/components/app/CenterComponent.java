package io.mateu.mdd.vaadinport.vaadin.components.app;

import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.vaadinport.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.JPAListViewComponent;
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
