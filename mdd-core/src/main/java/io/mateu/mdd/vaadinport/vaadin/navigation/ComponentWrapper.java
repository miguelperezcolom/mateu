package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.OwnedCollectionComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.SearchInMenuComponent;

public class ComponentWrapper extends AbstractViewComponent {
    private final Component wrapped;

    public Component getWrapped() {
        return wrapped;
    }

    public ComponentWrapper(String title, Component component) {
        setTitle(title);
        this.wrapped = component;

        addStyleName("componentwrapper");

        if (MDD.isMobile()) addComponent(component);
        else addComponentsAndExpand(component);

    }


    @Override
    public String toString() {
        return wrapped != null?wrapped.toString():"Nothing wrapped";
    }
}
