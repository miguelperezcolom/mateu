package io.mateu.mdd.vaadin.components;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.HasActions;
import io.mateu.mdd.core.interfaces.HasIcon;
import io.mateu.mdd.core.interfaces.ListView;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.ExpandOnOpen;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.fieldBuilders.components.IconComponent;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;

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

            VerticalLayout section = new VerticalLayout();
            section.addStyleName("section");
            section.addStyleName("result-page");

            if (wrapped != null) {
                section.addComponent(wrapped);
                section.setComponentAlignment(wrapped, Alignment.MIDDLE_CENTER);

                addBack(section);

                addComponent(section);
            }
        }
        return this;
    }

    private void addBack(VerticalLayout section) {
        ViewStack stack = MateuUI.get().getStack();
        View backToView = null;
        boolean listViewFound = false;
        for (int i = stack.size() -1; i >= 0 && !listViewFound; i--) {
            View v = stack.get(i);
            if (v.getViewComponent() instanceof ListViewComponent) {
                listViewFound = true;
                backToView = v;
            } else if (v.getViewComponent() instanceof EditorViewComponent) {
                backToView = v;
            }
        }
        if (backToView != null) {
            Button b;
            View finalBackToView = backToView;
            section.addComponent(b =
                    new Button("Back to " + backToView.getViewComponent().getTitle(),
                            e -> MDDUIAccessor.goTo(stack.getState(finalBackToView))));
            section.setComponentAlignment(b, Alignment.MIDDLE_CENTER);
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        }
    }

    @Override
    public boolean mustAddHeader() {
        return false;
    }

    @Override
    public boolean mustAddBreadcrumb() {
        return false;
    }

    @Override
    public boolean isBackable() {
        return false;
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
