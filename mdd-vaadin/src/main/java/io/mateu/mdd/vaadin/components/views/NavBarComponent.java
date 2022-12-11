package io.mateu.mdd.vaadin.components.views;

import com.vaadin.ui.Alignment;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.HorizontalLayout;
import io.mateu.mdd.shared.CSS;

public class NavBarComponent extends HorizontalLayout {

    public NavBarComponent() {
        addStyleName(CSS.NOPADDING);
        setDefaultComponentAlignment(Alignment.MIDDLE_LEFT);
        setSpacing(false);
    }

}
