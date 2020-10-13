package io.mateu.mdd.vaadin.components;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import com.vaadin.ui.Window;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.HasActions;
import io.mateu.mdd.core.interfaces.HasIcon;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.ExpandOnOpen;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;

import java.util.List;

public class ComponentWrapper extends AbstractViewComponent {
    private final Component wrapped;
    private final VaadinIcons _icon;
    private final boolean expand;

    @Override
    public VaadinIcons getIcon() {
        return wrapped instanceof HasIcon?((HasIcon)wrapped).getIcon():_icon;
    }

    public Component getWrapped() {
        return wrapped;
    }

    public ComponentWrapper(String title, Component component) {
        this(null, title, component, true);
    }

    public ComponentWrapper(VaadinIcons icon, String title, Component component, boolean expand) {
        setTitle(title);
        _icon = icon != null?icon:VaadinIcons.FILE;
        this.wrapped = component;
        this.expand = expand;

        addStyleName("componentwrapper");

        updatePageTitle();
    }

    @Override
    public AbstractViewComponent build() throws Exception {
        super.build();
        if (!(wrapped instanceof Window)) {
            if (MDDUIAccessor.isMobile() || (!expand && !(wrapped instanceof FullWidth))) addComponent(wrapped);
            else addComponentsAndExpand(wrapped);
        }
        return this;
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> as = super.getActions();
        if (wrapped instanceof HasActions) as.addAll(((HasActions) wrapped).getActions());
        return as;
    }

    @Override
    public String toString() {
        return getTitle() != null?getTitle():wrapped != null?wrapped.toString():"Nothing wrapped";
    }

    @Override
    public boolean expandOnOpen() {
        return wrapped != null && wrapped.getClass().isAnnotationPresent(ExpandOnOpen.class);
    }
}
