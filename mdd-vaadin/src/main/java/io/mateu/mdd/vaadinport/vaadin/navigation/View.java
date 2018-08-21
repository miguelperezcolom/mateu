package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.PrivateMenuFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.PublicMenuFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.CRUDViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;

public class View implements com.vaadin.navigator.View {

    private final Component viewComponent;
    private final ViewStack stack;
    private final Component component;
    private Label titleLabel;

    public View(ViewStack stack, Component component) {
        this.stack = stack;
        this.component = component;

        viewComponent = wrapComponent(component);


        if (component instanceof AbstractViewComponent) {
            ((AbstractViewComponent) component).setView(this);
        }

    }

    @Override
    public Component getViewComponent() {
        return viewComponent;
    }

    public Component getComponent() {
        return component;
    }

    @Override
    public String toString() {
        return viewComponent.toString();
    }










    private Component wrapComponent(Component component) {
        Component l;
        VerticalLayout vl;
        l = vl = new VerticalLayout();

        vl.addComponent(createHeader(component));

        if (!MDD.isMobile()) vl.setSizeFull();

        if (MDD.isMobile()) vl.addComponent(component);
        else vl.addComponentsAndExpand(component);

        return l;
    }


    private Component createHeader(Component component) {
        HorizontalLayout l = new HorizontalLayout();

        l.addStyleName("viewHeader");

        if (stack.size() > 0) l.addComponent(createBackLink());
        l.addComponent(createTitleLabel(component));

        return l;
    }

    private Component createTitleLabel(Component component) {
        titleLabel = new Label();
        titleLabel.addStyleName("viewTitle");

        updateViewTitle(component.toString());

        return titleLabel;
    }

    public void updateViewTitle(String newTitle) {
        titleLabel.setValue(newTitle);
        UI.getCurrent().getPage().setTitle((newTitle != null)?newTitle:"No title");
    }

    private Component createBackLink() {

        Button b = new Button(null, VaadinIcons.ARROW_CIRCLE_LEFT);
        b.setDescription("Back to " + stack.get(stack.size() - 1) + ". Click Ctrl + B to fire");
        b.addClickListener(e -> MyUI.get().getNavegador().goBack());
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("backlink");
        b.setClickShortcut(ShortcutAction.KeyCode.B, ShortcutAction.ModifierKey.CTRL);
        return b;
    }

}
