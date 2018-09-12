package io.mateu.mdd.vaadinport.vaadin.components.app.mobile;

import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.navigation.ComponentWrapper;

public class ViewContainer extends VerticalLayout {

    public ViewContainer() {
        addStyleName("viewcontainer");
        if (MDD.getPort().isMobile()) addStyleName(CSS.NOPADDING);
        else setSizeFull();
    }


    public void updateTitle(String title) {
        System.out.println("updateTitle(" + title + ")");
        if (getComponentCount() > 0) {
            Component c = getComponent(0);
            if (c instanceof ComponentWrapper) {
                ((ComponentWrapper) c).updateViewTitle(title);
            }
        }
    }
}
