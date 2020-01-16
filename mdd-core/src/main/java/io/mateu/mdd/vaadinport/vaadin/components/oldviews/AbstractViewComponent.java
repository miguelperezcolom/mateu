package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.AbstractMDDExecutionContext;
import io.mateu.mdd.vaadinport.vaadin.components.app.ViewContainer;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.*;
import io.mateu.mdd.vaadinport.vaadin.components.app.views.AreaComponent;
import io.mateu.mdd.vaadinport.vaadin.navigation.ComponentWrapper;
import io.mateu.mdd.vaadinport.vaadin.navigation.View;
import io.mateu.mdd.vaadinport.vaadin.navigation.ViewStack;

import javax.persistence.Entity;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout {

    private Label titleLabel;
    private CssLayout kpisContainer;
    private View view;
    protected CssLayout bar;
    protected Map<Method, AbstractAction> actionsByMethod = new HashMap<>();
    protected Map<String, Component> menuItemsById = new HashMap<>();
    protected Map<String, List<Component>> menuItemsByGroup = new HashMap<>();
    protected List<String> menuItemIdsUnseen = new ArrayList<>();
    private String title;
    private HorizontalLayout hiddens;
    private boolean backable;
    private boolean built;
    private AbstractViewComponent parentView;
    private Label iconLabel;

    public AbstractViewComponent getParentView() {
        return parentView;
    }

    public VaadinIcons getIcon() {
        return null;
    }

    public void setParentView(AbstractViewComponent parentView) {
        this.parentView = parentView;
    }

    public CssLayout getKpisContainer() {
        return kpisContainer;
    }

    public AbstractViewComponent() {
        addStyleName("viewcomponent");

        addComponent(createHeader());

        bar = new CssLayout();
        bar.addStyleName("actionsbar");
        bar.addStyleName(CSS.NOPADDING);
        menuItemsById = new HashMap<>();
        addBack(bar);
        getActionsContainer().addComponent(bar);

    }

    public boolean expandOnOpen() {
        return false;
    }

    private Component createHeader() {
        HorizontalLayout l = new HorizontalLayout();

        l.addStyleName("viewHeader");

        l.addComponent(createTitleLabel());

        hiddens = new HorizontalLayout();
        hiddens.addStyleName("hidden");

        l.addComponent(hiddens);


        return l;
    }

    public void setStack(ViewStack stack) {
        boolean add = MDD.isMobile();
        int pos = 0;
        if (!add && !(
                this instanceof WelcomeComponent
                        || this instanceof ByeComponent
                        || this instanceof LoginFlowComponent
                        || this instanceof PrivateMenuFlowComponent
                        || this instanceof PublicMenuFlowComponent
                        || this instanceof io.mateu.mdd.vaadinport.vaadin.components.app.views.AreaComponent
                        || this instanceof ModuleComponent
                        || this instanceof MenuFlowComponent
                        || this instanceof SearchInMenuComponent
        ) && stack.size() > 0) {
            add = true;
            while (!add && pos < stack.size()) {
                View v = stack.get(pos);
                Component c = v.getComponent();
                if (c instanceof ComponentWrapper) c = ((ComponentWrapper) c).getComponent(0);
                add = true;
                if (!(c instanceof WelcomeComponent
                        || c instanceof ByeComponent
                        || c instanceof LoginFlowComponent
                        || c instanceof PrivateMenuFlowComponent
                        || c instanceof PublicMenuFlowComponent
                        || c instanceof AreaComponent
                        || c instanceof ModuleComponent
                        || c instanceof MenuFlowComponent
                        || c instanceof SearchInMenuComponent)) add = true;
                if (!add) pos++;
            }
        }
        if (add
                //&& stack.size() > pos
                && this instanceof AbstractViewComponent) {
            ((AbstractViewComponent) this).setBackable(true);
            if (this instanceof EditorViewComponent) {
                ((EditorViewComponent) this).setKpisContainer(kpisContainer);
                ((EditorViewComponent) this).rebuildActions();
            }
        }
    }

    private Component createTitleLabel() {

        iconLabel = new Label("", ContentMode.HTML);
        iconLabel.addStyleName("viewIcon");

        titleLabel = new Label("", ContentMode.HTML);
        titleLabel.addStyleName("viewTitle");

        kpisContainer = new CssLayout();
        kpisContainer.addStyleName(CSS.NOPADDING);
        kpisContainer.addStyleName("kpisContainer");
        kpisContainer.setSizeUndefined();

        if (getIcon() != null) iconLabel.setValue(getIcon().getHtml());
        else iconLabel.setVisible(false);

        HorizontalLayout hl = new HorizontalLayout(iconLabel, titleLabel, kpisContainer);
        hl.addStyleName(CSS.NOPADDING);

        return hl;
    }


    public void updateViewTitle(String newTitle) {
        title = newTitle;
        updatePageTitle();
    }

    public void updatePageTitle() {
        titleLabel.setValue(getTitle());
        UI.getCurrent().getPage().setTitle((titleLabel.getValue() != null)?titleLabel.getValue():"No title");
        applyStyles(MDDUI.get().getViewContainer());
    }

    public HorizontalLayout getHiddens() {
        return hiddens;
    }

    public String getTitle() {
        return title != null?title:toString();
    }

    public A setTitle(String title) {
        this.title = title;
        return (A) this;
    }

    public View getView() {
        return view;
    }

    public void setView(View view) {
        this.view = view;
    }

    public Layout getActionsContainer() {
        return this;
    }

    public A buildIfNeeded() {
        if (!built) {
            try {
                build();
            } catch (Exception e) {
                MDD.alert(e);
            }
        }
        return (A) this;
    }

    public A build() throws Exception {
        addViewActionsMenuItems(bar);
        built = true;
        return (A) this;
    }

    private void addBack(CssLayout bar) {
            Component i = null;
            if (!isActionPresent("back")) {
                Button b;
                bar.addComponent(i = b = new Button("", VaadinIcons.ARROW_LEFT));
                //bar.addComponent(i = b = new Button("Back", VaadinIcons.ARROW_LEFT));
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addClickListener(e -> {
                    try {

                        if (AbstractViewComponent.this.beforeBack()) MDDUI.get().getNavegador().goBack();

                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                });

                addMenuItem("back", i);

            } else {
                i = getMenuItemById("back");
            }
            if (isBackable()) i.setVisible(true);
    }

    public void addViewActionsMenuItems(CssLayout bar) {

        if (isActionPresent("back")) {
            getMenuItemById("back").setVisible(isBackable());
        }

        for (AbstractAction a : getActions()) {
                Component i = null;
                if (!isActionPresent(a.getId())) {
                    Button b;
                    i = b = new Button(a.getName(), a.getIcon());
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                    b.addClickListener(e -> {
                        try {

                            Runnable r = new Runnable() {
                                @Override
                                public void run() {

                                    boolean needsValidation = AbstractViewComponent.this instanceof EditorViewComponent && a.isValidationNeeded();

                                    if (!needsValidation || ((EditorViewComponent)AbstractViewComponent.this).validate()) {

                                        a.run(new AbstractMDDExecutionContext());

                                        if (AbstractViewComponent.this instanceof EditorViewComponent && !(AbstractViewComponent.this instanceof OwnedCollectionComponent)) {

                                            EditorViewComponent evc = (EditorViewComponent) AbstractViewComponent.this;

                                            evc.getBinder().update(evc.getModel());

                                        }

                                    }

                                }
                            };

                            if (!Strings.isNullOrEmpty(a.getConfirmationMessage())) {
                                MDD.confirm(a.getConfirmationMessage(), new Runnable() {
                                    @Override
                                    public void run() {

                                        r.run();

                                        //todo: actualizar vista con los cambios en el modelo

                                    }
                                });
                            } else r.run();

                        } catch (Throwable throwable) {
                            MDD.alert(throwable);
                        }
                    });

                    if (!Strings.isNullOrEmpty(a.getGroup())) menuItemsByGroup.computeIfAbsent(a.getGroup(), k -> new ArrayList<>()).add(i);
                    addMenuItem(a.getId(), i);

                    if (!Strings.isNullOrEmpty(a.getStyle())) i.addStyleName(a.getStyle());

                    if (Strings.isNullOrEmpty(a.getGroup())) bar.addComponent(i);

                    a.addShortCut(b);

                } else {
                    i = getMenuItemById(a.getId());
                }
                if (i != null && !Strings.isNullOrEmpty(a.getStyle())) i.addStyleName(a.getStyle());
                i.setVisible(a.isVisible());
            }

        if (bar.getComponentCount() == 0 || (bar.getComponentCount() == 1 && !bar.getComponent(0).isVisible())) bar.setVisible(false);
    }

    public boolean beforeBack() {
        return true;
    }

    public void markAllAsUnseen() {
        menuItemIdsUnseen = new ArrayList<>(menuItemsById.keySet());
    }

    public List<String> getUnseenActions() {
        return menuItemIdsUnseen;
    }

    public void removeUnseen() {
        for (String id : menuItemIdsUnseen) menuItemsById.get(id).setVisible(false);
    }

    public boolean isActionPresent(String id) {
        boolean found = menuItemsById.containsKey(id);
        if (found) menuItemIdsUnseen.remove(id);
        return found;
    }

    public Component getMenuItemById(String id) {
        return menuItemsById.get(id);
    }

    public void addMenuItem(String id, Component i) {
        menuItemsById.put(id, i);
    }


    public List<AbstractAction> getActions() {
        return new ArrayList<>();
    }


    public AbstractAction getActionByMethod(Method m) {
        return actionsByMethod.get(m);
    }

    public void setAction(Method m, AbstractAction action) {
        actionsByMethod.put(m, action);
    }


    public boolean isBackable() {
        return backable;
    }

    public void setBackable(boolean backable) {
        this.backable = backable;
    }

    public void applyStyles(ViewContainer viewContainer) {

    }
}
