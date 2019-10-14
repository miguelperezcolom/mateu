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

public class ComponentWrapper extends VerticalLayout {
    private final ViewStack stack;
    private final Component wrapped;
    private Label titleLabel;
    private CssLayout kpisContainer;

    public Component getWrapped() {
        return wrapped;
    }

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

        boolean add = MDD.isMobile();

        if (!add && !(
                component instanceof WelcomeComponent
                        || component instanceof ByeComponent
                        || component instanceof LoginFlowComponent
                        || component instanceof PrivateMenuFlowComponent
                        || component instanceof PublicMenuFlowComponent
                        || component instanceof AreaComponent
                        || component instanceof ModuleComponent
                        || component instanceof MenuFlowComponent
                        || component instanceof SearchInMenuComponent
        ) && stack.size() > 0) {
            View v = stack.get(0);
            Component c = v.getComponent();
            if (c instanceof ComponentWrapper) c = ((ComponentWrapper) c).getComponent(0);
            if (!(c instanceof WelcomeComponent
                    || c instanceof ByeComponent
                    || c instanceof LoginFlowComponent
                    || c instanceof PrivateMenuFlowComponent
                    || c instanceof PublicMenuFlowComponent
                    || c instanceof AreaComponent
                    || c instanceof ModuleComponent
                    || c instanceof MenuFlowComponent
                    || c instanceof SearchInMenuComponent)) add = true;
        }

        l.addComponent(createTitleLabel(component));

        if (add && stack.size() > 0 && component instanceof AbstractViewComponent) {
            ((AbstractViewComponent) component).setBackable(true);
            if (component instanceof EditorViewComponent) {
                ((EditorViewComponent) component).setKpisContainer(kpisContainer);
                ((EditorViewComponent) component).rebuildActions();
            }
        }

        return l;
    }

    private Component createTitleLabel(Component component) {

        titleLabel = new Label("", ContentMode.HTML);
        titleLabel.addStyleName("viewTitle");

        if (component != null) updateViewTitle((component instanceof AbstractViewComponent)?((AbstractViewComponent)component).getTitle():component.toString());

        kpisContainer = new CssLayout();
        kpisContainer.addStyleName(CSS.NOPADDING);
        kpisContainer.addStyleName("kpisContainer");
        kpisContainer.setSizeUndefined();


        HorizontalLayout hl = new HorizontalLayout(titleLabel, kpisContainer);
        hl.addStyleName(CSS.NOPADDING);

        return hl;
    }


    private Component createBackLink(boolean deep) {

        Button b = new Button(null, VaadinIcons.ARROW_CIRCLE_LEFT);
        //b.setDescription("Back to " + stack.get(stack.size() - 1) + ". Click Ctrl + B to fire");
        b.addClickListener(e -> {
            if (wrapped instanceof OwnedCollectionComponent) {
                OwnedCollectionComponent cc = (OwnedCollectionComponent) wrapped;
                cc.getParentBinder().setBean(cc.getParentBinder().getBean(), false);
            }
            MDDUI.get().getNavegador().goBack();
        });
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        if (deep) b.addStyleName(CSS.GREYFGD);
        b.addStyleName("backlink");
        b.setClickShortcut(ShortcutAction.KeyCode.B, ShortcutAction.ModifierKey.CTRL);
        return b;
    }


    public void updateViewTitle(String newTitle) {
        titleLabel.setValue(newTitle);
        updatePageTitle();
    }

    public void updatePageTitle() {
        UI.getCurrent().getPage().setTitle((titleLabel.getValue() != null)?titleLabel.getValue():"No title");
    }

}
