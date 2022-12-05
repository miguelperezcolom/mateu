package io.mateu.mdd.vaadin.components.app;

import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ViewContainer extends VerticalLayout {

    public ViewContainer() {
        addStyleName("viewcontainer");
        if (MDDUIAccessor.isMobile()) addStyleName(CSS.NOPADDING);
        else setSizeFull();
    }

}
