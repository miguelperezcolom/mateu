package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.OwnedCollectionComponent;

public class ComponentWrapper extends VerticalLayout {
    private final ViewStack stack;
    private final Component wrapped;
    private Label titleLabel;

    public ComponentWrapper(ViewStack stack, Component component) {

        this.wrapped = component;

        addStyleName("componentwrapper");
        
        this.stack = stack;

        addComponent(createHeader(component));

        if (!MDD.isMobile()) setSizeFull();

        if (MDD.isMobile()) addComponent(component);
        else addComponentsAndExpand(component);

    }


    private Component createHeader(Component component) {
        HorizontalLayout l = new HorizontalLayout();

        l.addStyleName("viewHeader");

        if (stack.size() > 0) l.addComponent(createBackLink());
        l.addComponent(createTitleLabel(component));

        return l;
    }

    private Component createTitleLabel(Component component) {
        titleLabel = new Label("", ContentMode.HTML);
        titleLabel.addStyleName("viewTitle");

        if (component != null) updateViewTitle(component.toString());

        return titleLabel;
    }


    private Component createBackLink() {

        Button b = new Button(null, VaadinIcons.ARROW_CIRCLE_LEFT);
        b.setDescription("Back to " + stack.get(stack.size() - 1) + ". Click Ctrl + B to fire");
        b.addClickListener(e -> {
            if (wrapped instanceof OwnedCollectionComponent) {
                OwnedCollectionComponent cc = (OwnedCollectionComponent) wrapped;
                cc.getParentBinder().setBean(cc.getParentBinder().getBean(), false);
            }
            MDDUI.get().getNavegador().goBack();
        });
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("backlink");
        b.setClickShortcut(ShortcutAction.KeyCode.B, ShortcutAction.ModifierKey.CTRL);
        return b;
    }


    public void updateViewTitle(String newTitle) {
        titleLabel.setValue(newTitle);
        UI.getCurrent().getPage().setTitle((newTitle != null)?newTitle:"No title");
    }

}
