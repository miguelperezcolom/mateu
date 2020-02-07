package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.ExpandOnOpen;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.HasActions;
import io.mateu.mdd.core.interfaces.HasIcon;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.OwnedCollectionComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.SearchInMenuComponent;

import java.util.List;

public class ComponentWrapper extends AbstractViewComponent {
    private final Component wrapped;

    @Override
    public VaadinIcons getIcon() {
        return wrapped instanceof HasIcon?((HasIcon)wrapped).getIcon():VaadinIcons.FILE;
    }

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
    public List<AbstractAction> getActions() {
        List<AbstractAction> as = super.getActions();
        if (wrapped instanceof HasActions) as.addAll(((HasActions) wrapped).getActions());
        return as;
    }

    @Override
    public String toString() {
        return wrapped != null?wrapped.toString():"Nothing wrapped";
    }

    @Override
    public boolean expandOnOpen() {
        return wrapped != null && wrapped.getClass().isAnnotationPresent(ExpandOnOpen.class);
    }
}
