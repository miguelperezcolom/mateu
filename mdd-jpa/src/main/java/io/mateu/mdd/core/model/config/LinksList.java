package io.mateu.mdd.core.model.config;

import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.shared.CSS;

public class LinksList extends VerticalLayout {

    public LinksList() {
        super();
        addStyleName(CSS.NOPADDING);
    }

    public LinksList(Component... children) {
        super(children);
        addStyleName(CSS.NOPADDING);
    }
}
