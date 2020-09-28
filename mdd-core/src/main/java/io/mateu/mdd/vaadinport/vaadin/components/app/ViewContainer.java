package io.mateu.mdd.vaadinport.vaadin.components.app;

import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.navigation.ComponentWrapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ViewContainer extends VerticalLayout {

    public ViewContainer() {
        addStyleName("viewcontainer");
        if (MDD.isMobile()) addStyleName(CSS.NOPADDING);
        else setSizeFull();
    }


    public void updateTitle(String title) {
        log.debug("updateTitle(" + title + ")");
        if (getComponentCount() > 0) {
            Component c = getComponent(0);
            if (c instanceof ComponentWrapper) {
                ((ComponentWrapper) c).updateViewTitle(title);
            }
        }
    }
}
